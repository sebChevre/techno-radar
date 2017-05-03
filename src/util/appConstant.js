const AppConstant = function (appRoot) {

    var self = {};

    self.DIRECTORY_URL = '/xls/directory.json';
    self.URL_DIRECTORY_ERROR = 'OOOPS..! Une erreur est survenue lors de la récupération des fichiers';
    self.RADAR_VERSIONS_TITLE = 'Versions du radar';


    return self;
}

module.exports = AppConstant;
