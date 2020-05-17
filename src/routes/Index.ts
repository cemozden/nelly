import { ExpressSettings } from "./Routes";
import { Theme } from "../config/ThemeManager";

export default function Index(exp : ExpressSettings, systemLocale : string, theme : Theme) {
    exp.expressObject.get('/', (req, res) => {

        res.render('main', {
            nellyVersion : process.env.npm_package_version,
            expressURL : exp.url,
            systemLocale,
            theme
        });
    });
}