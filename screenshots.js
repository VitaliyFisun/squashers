const puppeteer = require('puppeteer');
const fs = require('fs');
class Screenshot{
    constructor(options){
        options = this.parseOptions(options);
        this.options = Object.assign({}, this.getDefaultOptions(), options);
        // console.log(this.options);
    }

    getDefaultOptions(){
        return {
            width: 1366,
            height: 768,
            top: 0,
            left: 0,
            isMobile: false,
            viewPortWidth: 1366,
            viewPortHeight:768,
            extension: '.jpg',
            type: 'jpeg',
            deviceScaleFactor: 1,
            hasTouch: false,
            isLandscape: false,
            path: './screenshots/',
            url: 'https://google.com'
        };
    }

    parseOptions(options){
        if(options && typeof options === 'object'){
            if(options.width) options.width = parseInt(options.width);
            if(options.height) options.height = parseInt(options.height);
            if(options.top) options.top = parseInt(options.top);
            if(options.left) options.left = parseInt(options.left);
            if(options.viewPortWidth) options.viewPortWidth =  parseInt(options.viewPortWidth);
            if(options.viewPortHeight) options.viewPortHeight = parseInt(options.viewPortHeight);
            if(options.deviceScaleFactor) options.deviceScaleFactor = parseInt(options.deviceScaleFactor);
            if(options.html) {
                let buff = Buffer.from(options.html, 'base64');
                options.html = decodeURI(buff.toString());
            }
            if(options.url && options.url.indexOf('http://') !== 0 && options.url.indexOf('https://')){
                options.url = `http://${options.url}`;
            }

            return options;

        }else{
            return {};
        }
    }

    createUniqueName(prefix){
        return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
    }

    take(){
        const viewport = {
            width: this.options.width,
            height: this.options.height,
            deviceScaleFactor: this.options.deviceScaleFactor,
            isMobile: this.options.isMobile,
            hasTouch: this.options.hasTouch,
            isLandscape: this.options.isLandscape
        };
        const opts = {
            path: this.options.path + this.createUniqueName('test') + this.options.extension,
            type: this.options.type,
            quality: 70,
                
        };

        //console.log(this.options);
        return this._takeScreenshot(viewport, opts);
    }

    _takeScreenshot(viewport, options){
        return new Promise((resolve, reject) => {
            puppeteer.launch({ignoreHTTPSErrors: true, args:['--no-sandbox']})
                .then( 
                    //browser launched
                    (browser) => {
                        browser.newPage()
                            .then(
                                //page created
                                (page) => {
                                    //page.setContent
                                    page.goto(`data:text/html,${this.options.html}`, {timeout: 450000})
                                        .then(
                                            // successfully naviagated to url
                                            (resp) =>  {
                                                return page.setViewport(viewport);
                                            },
                                            (err) => {
                                                reject({status:'error', reason: 'can\'t naviage to page', err: err});
                                            }
                                        )
                                        .then( 
                                            (resp) => {
                                                return page.evaluate( (_left, _top) => {
                                                    window.scrollTo(_left, _top);
                                                    return Promise.resolve();
                                                }, this.options.left, this.options.top);
                                            }
                                        )
                                        .then(
                                            (resp) => { 
                                                return page.screenshot(options); 
                                            },
                                            (err) => {
                                                reject({status:'error', reason: 'can\'t teage screenshot', err: err});
                                            }
                                        )
                                        .then((buffer) => {
                                            fs.unlink(options.path, (err) => {if(err) console.log(err);});
                                            browser.close(); 
                                            resolve( {
                                                img: `data:image/${this.options.type};base64,${buffer.toString('base64', 0)}`,
                                                status: 'ok'
                                            })
                                        })

                                },
                                //reject to create the page
                                (err) => {
                                    reject({status:'error', reason: 'can\'t create a page', err: err});
                                }
                            )
                    }, 
                    //reject to launch the browser
                    (err) => { 
                        reject({status:'error', reason: 'can\'t launch browser', err: err});
                    } 
                )
                .catch((err) => {
                    console.log(err);
                    reject({status:'error', reason: 'some shit happend', err: err})
                });
        });
    }
    
}

module.exports = Screenshot;
