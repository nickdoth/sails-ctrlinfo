function ctrlInfo(ctrlList) {
    return (req, res) => {
        if (!req.method in ctrlList) {
            console.log("req:", req.method);
            res.send('Api Not found');
        }

        var applyFuncs = buildApplies(req);

        for (var method in ctrlList) {
            if (req.method !== method) {
                continue;
            }

            var ctrl = ctrlList[method];
            var noApi = (req.wantsJSON && !ctrl.json) && 
                (!req.wantsJSON && !ctrl.view);

            if (!noApi) {
                var promise = ctrl.act(applyFuncs, req);
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

                if (req.wantsJSON) {
                    promise = promise.then((result) => res.json(ctrl.json(result)));
                }
                else {
                    promise = promise.then((result) => {
                        if (ctrl.redirect) {
                            typeof ctrl.redirect === 'string' ?
                                res.redirect(ctrl.redirect) : 
                                res.redirect(ctrl.redirect(result));
                            return;
                        }
                        res.view.apply(res, ctrl.view(result));
                    });
                }

                promise.catch((err) => {
                    if (req.wantsJSON) { 
                        ctrl.jsonError ? ctrl.jsonError(err) : res.json({ error: err });
                    }
                    else {
                        ctrl.viewError ? ctrl.viewError(err) : res.serverError(err);
                    }
                });
            }
            else {
                res.send('Api Not found');
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
