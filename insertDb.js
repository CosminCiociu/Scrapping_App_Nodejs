/////////////////////////////////
///Start inserting in database///
/////////////////////////////////

var fs = require('fs');
// var { promises: fs } = require('fs')
const axios = require('axios').default;
const puppeteer = require('puppeteer');
var url = 'https://test.org/';
const sharp = require('sharp');
const { scrollPageToBottom } = require('puppeteer-autoscroll-down');
const delay = require('delay');


module.exports = {
    insertIntoDb : async function insertIntoDb(data) {
		console.log('Start');
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
		await page.goto(url, { waitUntil: 'networkidle0', timeout:0 });
		await scrollPageToBottom(page, {
			size: 500,
			delay: 1000
		})
		await insertionDatabase(page,data);
		console.log('End');
		browser.close()
		return

	}
}


async function insertionDatabase(page,data) {
	for(const [index, value] of Object.entries(data.videos)){
		if(!value.url) {
        continue;
      }
	const imageName = Math.random().toString(36).substr(2, 9)

	const statusCode = await axios.post('http://127.0.0.1:8000/api/videos', {
		title: value.title,
		imageUrl: imageName,
		videoUrl:  value.url.toString(),
		duration: value.duration,
		folderName: value.folderImageName,
		categories: value.category,
		stars: value.star
		}).then(async resp => {
			return await resp.status
		})
		.catch(function (error) {
		console.log(error);
		process.exit(1);
		});
		if(statusCode == 200) {
			await storeImageLocal(index, imageName, page, value.imageThumbnail);
			await delay(2000);
		}
		if(statusCode == 208) {
			console.log(`Already in db ${value.url}`)
			await delay(2000);
		}
	}
}


async function storeImageLocal(i, uniqueId, page, thumbURL) {
	var path = `../facetube-LVue/storage/app/public/images-videos/${new Date().toISOString().slice(0, 10)}`;
    //Testing
    // var path = `./images-videos/${new Date().toISOString().slice(0, 10)}`;
    if (!fs.existsSync(path)){
        fs.mkdirSync(path);
        console.log('Folder Created Successfully.');
    }
	
	try{
		//Taking screenshoots of an element in browser 
		await page.goto(thumbURL, { waitUntil: 'networkidle0', timeout:5000 });
		await page.waitForSelector('body > img')
		const imageElement = await page.$('body > img');
		const imageContainer = await imageElement.boundingBox();      // this method returns an array of geometric 
		const x = imageContainer['x'];                                // coordinate x
		const y = imageContainer['y'];                                // coordinate y
		const w = imageContainer['width'];                            // area width
		const h = imageContainer['height'];                           // area height
		await page.screenshot({
			path: `${path}/${uniqueId}.jpg`,
			'clip': {'x': x, 'y': y, 'width': w, 'height': h}
		}).then(() =>{
		console.log(`Image saved ${i}`)
		});

		await resizeImage(`${path}/${uniqueId}.jpg`);

	} catch (error) {
		return;
		// process.exit(1);
	}
}

async function resizeImage(imgPath) {
	let imgBuffer = await sharp(imgPath).toBuffer()
	let thumbnail = await sharp(imgBuffer).resize(403, 227).toBuffer()
	fs.writeFile(imgPath, thumbnail, err => {
		if(err) console.log(err)
	})
	console.log('Image resized');
	return;
} 


    /////////////////////////////////
    ////End inserting in database////
    /////////////////////////////////


