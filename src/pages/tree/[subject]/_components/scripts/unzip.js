const unzipTree = (zipped) => {
    let keys = Object.keys(zipped);
    // console.log("zipped")
    // console.log(zipped)
    keys.forEach((k) => {
        zipped[k].id = k;
    });
    keys.forEach((k) => {
        //console.log(keys)
        if (zipped[k].p) {
            //  console.log('parent avant/apres')
            //  console.log(zipped[k].p)
            zipped[k].p = zipped[keys[parseInt(zipped[k].p)]];
            //  console.log(zipped[k].p)
        }
        if (zipped[k].co) {
			//  console.log('parent avant/apres')
			//  console.log(zipped[k].p)
			zipped[k].co = zipped[keys[parseInt(zipped[k].co)]]
			//  console.log(zipped[k].p)
		}
        if (zipped[k].c) {
            // console.log("children avant/apres")
            // console.log(zipped[k].c)
            zipped[k].children=[]
            zipped[k].c.forEach((c, i) => {
                zipped[k].children[i] = zipped[keys[parseInt(c)]];
            });
            delete zipped[k].c
        }
    });
};
export default unzipTree