
class SiteController {
    index(req, res, next) {
        res.render('index');
    }

    about(req, res, next) {
        res.render('about');
    }

    contact(req, res, next) {
        res.render('contact');
    }
}

module.exports = new SiteController();
