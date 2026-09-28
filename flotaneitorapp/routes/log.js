module.exports = function (app, logsRepository) {

    /**
     * Muestra la lista de logs para administradores, con filtrado por tipo y ordenados por fecha.
     * Muestra un error si falla.
     */
    app.get('/log/list', function (req, res) {
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).render('error.twig', {
                message: 'Acción prohibida: solo los administradores pueden acceder a esta sección.',
                error: { status: 403 }
            });

        }
        let filter = {};
        let search = req.query.search || '';

        if (search !== '') {
            filter = {"type": {$regex: new RegExp(search, 'i')}};
        }
        let options = {sort: {date: -1}};
        logsRepository.getLogs(filter, options).then(logs => {
            let response = {
                logList: logs,
            }
            res.render("log/list.twig", response);
        }).catch(error => {
            res.send("Se ha producido un error al mostrar la lista de logs:" + error)
        });
    });

    /**
     * Endpoint que elimina logs según un término de búsqueda y redirige a la lista de logs.
     */
    app.get('/log/delete', function (req, res) {
        let filter = {};
        let search = req.query.search || '';

        if (search !== '') {
            filter = {"type": {$regex: new RegExp(search, 'i')}};
        }

        logsRepository.deleteLogs(filter).then(() => {
            res.redirect('/log/list?search=' + encodeURIComponent(search));
        }).catch(error => {
            res.send("Se ha producido un error al eliminar los logs: " + error)
        });
    });
}
