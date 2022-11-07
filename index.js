const url = 'https://test.org/';
const jsonPath = './jsonsScraped/videos.json';
const jsonCategoryPath = './categories/TEST.json';

const landing           =   require('./scrapeLanding');
const readData          =   require('./readJson');
// const replaceCat     =   require('./readJson');
const insert            =   require('./insertDb');
const insertCategories  =   require('./insertingCategories');
const insertStars       =   require('./insertingStars');

const foo = async () => {
    console.log('Start scrapping Landing');
    await landing.scrapeVideo(url);

    console.log('Reading data from json');
    var data = await readData.readJson(jsonPath);

    console.log('Reading data from json Categories');
    var CatData = await readData.readJson(jsonCategoryPath);
    await insertCategories.insertCategories(CatData);

    console.log('Reading data from json Stars');
    var Data = await readData.readJson(jsonPath);
    await insertStars.insertStars(Data);

    console.log('Insertion data in DB');
    await insert.insertIntoDb(data);
  }

foo();