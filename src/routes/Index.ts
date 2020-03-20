import Express from "express";

export default function Index(exp : Express.Application, expressURL) {
    exp.get('/', (req, res) => {
        res.render('main', {
            nellyVersion : process.env.npm_package_version,
            expressURL : expressURL
        });
    });
}