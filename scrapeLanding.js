const puppeteer = require('puppeteer');
const { scrollPageToBottom } = require('puppeteer-autoscroll-down');
var fs = require('fs');


module.exports = {
    scrapeVideo : async function scrapeVideo(url) {
        const browser = await puppeteer.launch(
            {
            args: [
            '--ignore-certificate-errors',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            "--disable-accelerated-2d-canvas",
            "--disable-gpu",
            '--incognito'
            ],
            ignoreHTTPSErrors: true,
            headless: false,
          }
          );
        const page = await browser.newPage();
        await page.goto(url,{ waitUntil: "networkidle0", timeout: 60000 });
        /////////////////////////////////
        /////Front Page Starts Here//////
        /////////////////////////////////
        
        await scrollPageToBottom(page, {
        size: 500,
        delay: 1000
        })
        
        // Gather Urls for each video
        const nextPagesUrls = await page.$$eval(
            'div.thumbs > ul > li > a.th',
            nextPagesUrls => nextPagesUrls.map(link => link.href)
        );
        await page.waitForSelector('div.thumbs > ul > li:last-child');
    
        const ThumbsFirstPage = await page.evaluate(async () => {
            // Get Images Array
            const ImagesArray = await Array.from(
              document.querySelectorAll("div.thumbs > ul > li > a > img")
            )
            .map((container) => {
                try{
                    let imageSrc = container.src;
                    return ((imageSrc !== undefined) ? imageSrc : '');
                }catch(e) {
                    return '';
                }
            });
    
            //Get Duration Array
    
            const DurationArray = Array.from(
                document.querySelectorAll("div.thumbs > ul > li")
              ).map((container) => {
                try{
                    let duration = container.childNodes[1].childNodes[3].childNodes[3].childNodes[2].innerHTML;
                    return ((duration !== undefined) ? duration : '');;
    
                }catch(e) {
                    return '';
                }
            })
    
            const TitlesArray = Array.from(
                document.querySelectorAll("img.lazy")
              ).map((title) => {
                try{
                    let titleValue = title.getAttribute('alt');
                    return ((titleValue !== undefined) ? titleValue : '');
                }catch(e) {
                    return '';
                }
            })
            return {
                'images'    :  ImagesArray,
                'durations' :  DurationArray,
                'titles'    :  TitlesArray,
            } 
        });
       
    
        /////////////////////////////////
        /////Front Page Ends Here////////
        /////////////////////////////////
    
    
        /////////////////////////////////
        /////Video Page Starts Here//////
        /////////////////////////////////
           
        nextPagesVideoUrls = [];
        categoriesArray = [];
        starsArray = [];
        downloadLink = []
        passed = true;
        for (i=0; i<nextPagesUrls.length; i++){
        // for (i=0; i<3; i++){
            try{
                await page.goto(nextPagesUrls[i],{'timeout': 0, 'waitUntil':'load'});
                await scrollPageToBottom(page, {
                    size: 500,
                    delay: 250
                    })
    
                nextPagesVideoUrls[i] = await page.$$eval(
                    'div.video-container > iframe',
                    nextPagesVideoUrls => nextPagesVideoUrls.map(iframe => (iframe.getAttribute('src') !== undefined ? iframe.getAttribute('src') : null))
                );
    
                categoriesArray[i] = await page.$$eval(
                    'body > div.wrapper_content > div.main > div.holder > div.video-content > div.tools_cat > a[rel="tcategory"]',
                    categoriesArray => categoriesArray.map(category => (category.innerText !== undefined ? category.innerText : ''))
                );
    
                starsArray[i] = await page.$$eval(
                    'body > div.wrapper_content > div.main > div.holder > div.video-content > div.red_tools > a',
                    starsArray => starsArray.map(star => (star.innerText !== undefined ? star.innerText : ''))
                );
    
                downloadLink[i] = await page.$$eval(
                    'body > div.wrapper_content > div.main > div.holder > div.video-content > div.vpage_premium_bar > a',
                    downloadLink => downloadLink.map(link => (link.href !== undefined ? link.href : ''))
                );
    
                if(!nextPagesVideoUrls[i].length) {
                    let nextNextPage = await page.$$eval(
                        'div.video-container video > source',
                        nextPagesVideoUrls => nextPagesVideoUrls.map(element => (element.getAttribute('src') !== undefined ? element.getAttribute('src') : null))
                    );
                    // await page.goto(nextNextPage[0],{'timeout': 0, 'waitUntil':'load'});
                    // await scrollPageToBottom(page, {
                    //     size: 500,
                    //     delay: 250
                    // })
                    nextPagesVideoUrls[i] = nextNextPage[0];
                }
                console.log(i);
    
            }catch (error) {
                // console.log(error);
                // process.exit(1);
                console.log('Page not good for scraping');
                continue;
              }
        }   
        
    
        /////////////////////////////////
        /////Video Page Ends Here////////
        /////////////////////////////////
    
    
    
        const VideoInfo = {};
        var Category = JSON.parse(fs.readFileSync(`./categories/TEST.json`));
    
        for (i=0; i<nextPagesUrls.length; i++){
        // for (i=0; i<3; i++){
            VideoInfo[i] = {
                'index'            :   i,
                'title'            :   ThumbsFirstPage.titles[i],
                'url'              :   nextPagesVideoUrls[i],
                'duration'         :   ThumbsFirstPage.durations[i],
                'category'         :   categoriesArray[i],
                'star'             :   starsArray[i],
                'category'         :   categoriesArray[i],
                'downloadLink'     :   downloadLink[i],
                'folderImageName'  :   new Date().toISOString().slice(0, 10),
                'imageThumbnail'   :   ThumbsFirstPage.images[i],
            };
            
            let difference = categoriesArray[i].filter(x => !Category['categories'].some(({ category: x2 }) => x2 === x));
            if(difference.length > 0) {
                difference.forEach(category => {
                    Category['categories'].push({category,'url' : ''})
                });
            }
        }
    
        
        var json = JSON.stringify({'videos' : VideoInfo});
        // fs1.writeFileSync(`./jsonsScraped/${new Date().toISOString().slice(0, 10)}.json`, json);
        fs.writeFileSync(`./jsonsScraped/videos.json`, json);
        // console.log(json);
    
        // var jsonCategories = JSON.stringify({'categories' : Category});
        // fs.writeFileSync(`./categories/DiffCategories.json`, jsonCategories);
    
        browser.close()
        return
    }
    
        /////////////////////////////////
        /////End of Scraping Pages///////
        /////////////////////////////////
    
  };
