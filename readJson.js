const fs = require('fs');
const axios = require('axios').default;

module.exports = {
    readJson : async function readJson(path) { 
		try {
			data = JSON.parse(fs.readFileSync(path, 'utf8'));
			return data;
			// console.log(data)
		  } catch (err) {
			console.error(err)
		  }
	},

	// getCategoryIds : async function getCategoryIds(data) { 
	// 	for(const [index, value] of Object.entries(data.videos)){
	// 		if(!value.url) {
	// 		continue;
	// 	  }
	
	// 	const response = await axios.post('http://127.0.0.1:8000/api/convert-categories', {
	// 		categories: value.category
	// 		}).then(async response => {
	// 			return await response
	// 		})
	// 		.catch(function (error) {
	// 		console.log(error);
	// 		process.exit(1);
	// 		});

	// 		data.videos[index].category = response.data;
	// 	}
	// }
}