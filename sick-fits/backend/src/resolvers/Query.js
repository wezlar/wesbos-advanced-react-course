const { forwardTo } = require('prisma-binding');

const Query = {
    // below replaces the items function below
    items: forwardTo('db'),
    item: forwardTo('db'),
    itemsConnection: forwardTo('db'),
    me(parent, args, ctx, info) {
        // check if thereis a currert user id
        if (!ctx.request.userId) {
            return null;
        }
        return ctx.db.query.user(
            {
                where: { id: ctx.request.userId },
            }, 
            info
        );
    }
};

module.exports = Query;
