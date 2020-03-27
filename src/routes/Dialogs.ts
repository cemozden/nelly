import { ExpressSettings } from "./Routes";

export default function Dialogs(exp : ExpressSettings) {
    exp.expressObject.get('/addnewfeed_dialog', (req, res) => {
        res.render('addfeed');
    });
}