/////////////////////////////////
///Start inserting categories ///
/////////////////////////////////

const puppeteer = require('puppeteer');
const sharp = require('sharp');
const axios = require('axios').default;
const delay = require('delay');
var fs = require('fs');
const GoogleImages = require('google-images');
const client = new GoogleImages('569c940f7aca847ae', 'AIzaSyAB9G-mIJZEBrXSJm50z6Jm9WbBw6R7mbE');


module.exports = {
    insertStars : async function insertStars(data){
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
	
		await insertDbStar(data.videos, page);
		
		browser.close()
		console.log('Ales GOOOD Star')
	}
}


async function insertDbStar(data, page) {
	for(const [key, value] of Object.entries(data)){
		if(!value.star) {
        continue;
      }
	  for (const star of value.star) {
		  if(star.trim().split(' ').length !== 2){
			// console.log(star);
			continue;
		  }

		const imageName = Math.random().toString(36).substr(2, 9);

		const starResults = await client.search(`${star} person`, {size: 'large'});
		await delay(2000);

		const statusCode = await axios.post(`http://127.0.0.1:8000/api/stars`,{
			name: star,
			imageUrl: imageName,
		})
		.then(resp => {
			return resp.status
		})
		.catch(err => {
			// Handle Error Here
			console.error(err);
		});
		if(statusCode == 200) {
			try {
				const i = 0;
				await storeImageLocalStars(key, imageName, page, starResults[0].url);
			}catch (error) {
				await storeImageLocalStars(key, imageName, page, starResults[i++].url);
				console.log(error);
			}
		}
	  }
	}
}


async function storeImageLocalStars(i, uniqueId, page, starUrl) {
	var path = `../facetube-LVue/storage/app/public/stars`;
    //Testing
    // var path = `./images-videos/${new Date().toISOString().slice(0, 10)}`;
    if (!fs.existsSync(path)){
        fs.mkdirSync(path);
        console.log('Folder Created Successfully.');
    }

	try{
		await page.goto(starUrl, { waitUntil: 'networkidle0', timeout:5000 });
		await page.waitForSelector('body > img')
		const imageElement = await page.$('body > img');
		const imageContainer = await imageElement.boundingBox();      // this method returns an array of geometric 
		const x = imageContainer['x'];                                // coordinate x
		const y = imageContainer['y'];                                // coordinate y
		const w = imageContainer['width'];                            // area width
		const h = imageContainer['height'];                           // area height
		await page.screenshot({
			path: `${path}/${uniqueId}.png`,
			'clip': {'x': x, 'y': y, 'width': w, 'height': h}
		}).then( () =>{
			console.log(`Image screenshooted ${i}`);
		})
		await resizeImage(`${path}/${uniqueId}.png`);
		
	} catch (error) {
	console.log(error);
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

