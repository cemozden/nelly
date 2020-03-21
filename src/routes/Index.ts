import Express from "express";
import moment from "moment";

export default function Index(exp : Express.Application, expressURL, systemLocale : string) {
    exp.get('/', (req, res) => {

        res.render('main', {
            nellyVersion : process.env.npm_package_version,
            expressURL : expressURL,
            systemLocale
        });
    });
}