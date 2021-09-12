
class SiteController {
    index(req, res, next) {
        res.render('index');
    }

    about(req, res, next) {
        res.render('about');
    }
}

module.exports = new SiteController();
