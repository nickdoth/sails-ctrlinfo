function ctrlInfo(ctrlList) {
    return (req, res) => {
        if (!req.method in ctrlList) {
            console.log("req:", req.method);
            res.send('Api Not found');
        }
        
        expressSupport(req, res);

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
                        req.session.regenerate(() => {
                            Object.assign(req.session, sess);
                        });
                    }
                    else if (ctrl.session) {
                        var sess = ctrl.session(result);
                        Object.assign(req.session, sess);
                    }
                    return result;
                });
                
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
                    ctrl.viewError ? res.send(ctrl.viewError('ApiNotFound')) : res.send('ApiNotFound');   
                }
                return promise.then((result) => {
                    var viewAndModel = ctrl.view(result, req);
                    if (typeof viewAndModel === 'string') {
                        res.redirect(viewAndModel);
                    }
                    else {
                        res.view.apply(res, viewAndModel);
                    }
                }).catch(err => {
                    ctrl.viewError ? res.view.apply(res, ctrl.viewError(err)) : res.send('<pre>' + err + '</pre>');
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

function expressSupport(req, res, ctrl) {
    if (!res.view) {
        res.view = res.render;
    }
    
    if (!req.hasOwnProperty('wantsJSON')) {
        if (req.hasOwnProperty('wantsJson')) {
            req.wantsJSON = req.wantsJson;
        }
        else {
            req.wantsJSON = req.xhr || 
                req.accepts('html', 'json') === 'json' || 
                (req.get('Accept') && req.get('Accept').indexOf('html') < 0);
        }
    }
}

module.exports = ctrlInfo;
