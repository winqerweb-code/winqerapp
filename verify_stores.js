const { getStores } = require('./src/app/actions/store');

async function check() {
    try {
        const result = await getStores();
        console.log(JSON.stringify(result, null, 2));
    } catch (e) {
        console.error(e);
    }
}

check();
