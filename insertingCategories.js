/////////////////////////////////
///Start inserting categories ///
/////////////////////////////////

var fs = require('fs');
const axios = require('axios').default;
const puppeteer = require('puppeteer');
const sharp = require('sharp');


module.exports = {
    insertCategories : async function insertCategories(data){
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
	
		await insertionDatabaseCategories(data, page);
	
		browser.close()
		console.log('Ales GOOOD')
	}
}



async function insertionDatabaseCategories(data, page) {
	for(const [key, value] of Object.entries(data.categories)){
		if(!value.url) {
        continue;
      }
	const imageName = Math.random().toString(36).substr(2, 9)

	const statusCode = await axios.post('http://127.0.0.1:8000/api/categories', {
		title: value.category,
		imageUrl: imageName,
		}).then(resp => {
			return resp.status
		})
		.catch(function (error) {
		console.log(error);
		// process.exit(1);
		});
		if(statusCode == 200) {
			await storeImageLocalCategories(key, imageName, page, value.url);
		}
	}
}


async function storeImageLocalCategories(i, uniqueId, page, url) {
	var path = `../facetube-LVue/storage/app/public/categories`;
    //Testing
    // var path = `./images-videos/${new Date().toISOString().slice(0, 10)}`;
    if (!fs.existsSync(path)){
        fs.mkdirSync(path);
        console.log('Folder Created Successfully.');
    }

	try{
		await page.goto(url, { waitUntil: 'networkidle0', timeout:5000 });
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

