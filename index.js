function ctrlInfo(ctrl) {
    return (req, res) => {
        if (!req.method in ctrl) {
            req.send('Api Not found');
        }

        var applyFuncs = buildApplies(req);

        for (var method in ctrl) {
            if (req.method !== method) {
                continue;
            }

            var noApi = (req.wantsJson && !ctrl.json) || 
                (!req.wantsJson && !ctrl.view);

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

                if (req.wantsJson) {
                    promise = promise.then((result) => req.json(ctrl.json(result)));
                }
                else {
                    promise = promise.then((result) => {
                        if (ctrl.redirect) {
                            typeof ctrl.redirect === 'string' ?
                                req.redirect(ctrl.redirect) : 
                                req.redirect(ctrl.redirect(result));
                            return;
                        }
                        req.view.apply(req, ctrl.view(result));
                    });
                }

                promise.catch((err) => req.wantsJson ? 
                    ctrl.jsonError(err) : ctrl.viewError(err));
            }
            else {
                req.send('Api Not found');
            }
        }
    }
}

function buildApplies(req: express.Request) {
    return {
        query(servFunc) {
            var args = Array.prototype.slice.call(arguments, 1);
            servFunc.apply(null, args.map(n => req.query[n]));
        }
    }
}

module.exports = ctrlInfo;
