import { ExpressSettings } from "./Routes";

export default function Index(exp : ExpressSettings, systemLocale : string) {
    exp.expressObject.get('/', (req, res) => {

        res.render('main', {
            nellyVersion : process.env.npm_package_version,
            expressURL : exp.url,
            systemLocale
        });
    });
}