function ctrlInfo(ctrlList) {
    return (req, res) => {
        if (!req.method in ctrlList) {
            console.log("req:", req.method);
            res.send('Api Not found');
        }

        for (var method in ctrlList) {
            if (req.method !== method) {
                continue;
            }

            var ctrl = ctrlList[method];
            var noApi = (req.wantsJSON && !ctrl.json) && 
                (!req.wantsJSON && (!ctrl.view)) && 
                !ctrl.redirect;

            if (!noApi) {
                var promise = ctrl.act ? ctrl.act(req) : Promise.resolve(null);
                promise = promise.then((result) => {
                    if (ctrl.sessionReplace) {
                        var sess = ctrl.sessionReplace(result);
                        req.session.destroy(() => {
                            Object.assign(req.session, sess);
                        });
                    }
                    else if (ctrl.session) {
                        var sess = ctrl.session(result);
                        Object.assign(req.session, sess);
                    }
                    return result;
                });
                
                if (ctrl.redirect) {
                    return promise.then((result) => {
                        typeof ctrl.redirect === 'string' ?
                            res.redirect(ctrl.redirect) : 
                            res.redirect(ctrl.redirect(result));
                    });
                }
            }

            if (req.wantsJSON) {
                if (noApi) {
                    ctrl.jsonError ? res.json(ctrl.jsonError('ApiNotFound')) : res.json({error: 'ApiNotFound'});
                    return;
                }
                return promise.then((result) => res.json(ctrl.json(result, req))).catch(err => {
                    ctrl.jsonError ? res.json(ctrl.jsonError(err)) : res.json({ error: err });
                });
            }
            else {
                if (noApi) {
                    ctrl.viewError ? res.send(ctrl.viewError('ApiNotFound')) : res.badRequest('ApiNotFound');   
                }
                return promise.then((result) => {
                    res.view.apply(res, ctrl.view(result, req));
                }).catch(err => {
                    ctrl.viewError ? res.send(ctrl.viewError(err)) : res.serverError(err);
                });
            }
        }
    }
}

function buildApplies(req) {
    return {
        query(servFunc) {
            var args = Array.prototype.slice.call(arguments, 1);
            return servFunc.apply(null, args.map(n => req.query[n]));
        }
    }
}

module.exports = ctrlInfo;
