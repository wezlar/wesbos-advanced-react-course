const { forwardTo } = require('prisma-binding');
const { hasPermission } = require('../utils');

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
    },
    async users(parent, args, ctx, info) {
        // 1. check if they are logged in
        if (!ctx.request.userId) {
            throw new Error('You must be logged in!');
        }
        // 2. check if the user has permission to query all the users
        hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']);

        // 3. if they do, query all the users
        return ctx.db.query.users({}, info); // {} is an empty where query
    },
    async order(parent, args, ctx, info) {
        // 1. make sure they are logged in
        if (!ctx.request.userId) {
            throw new Error('You aren\'t logged in!');
        }
        // 2. query the current order
        const order = await ctx.db.query.order({
            where: { id: args.id },
        }, info);
        // 3. check if they have the permission to see this order
        const ownsOrder = order.user.id === ctx.request.userId;
        const hasPermissionToSeeOrder = ctx.request.user.permissions.includes('ADMIN');
        if (!ownsOrder || !hasPermissionToSeeOrder) {
            throw new Error('You can\'t see this');
        }
        // 4. return the order
        return order;
    }
};

module.exports = Query;
