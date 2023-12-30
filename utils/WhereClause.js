

class WhereClause {

    constructor(base, basequery) {
        this.base = base;
        this.basequery = basequery;
    }

    search() {
        let filterObj = {};
        if (this.basequery?.search) {
            filterObj.name = { $regex: this.basequery.search, $options: "i" };
        }

        if (this.basequery?.category) {
            filterObj.category = this.basequery.category;

        }

        this.base = this.base.find({ ...filterObj }).sort({ createdAt: -1 });
        return this;
    }

    filter() {
        if (!this.basequery.hasOwnProperty('gte') || !this.basequery.hasOwnProperty('lte')) return this.base;
        const queryObj = this.basequery;
        delete queryObj.category;
        delete queryObj.search;

        const query = Object.fromEntries(
            Object.entries(queryObj).map(entry => [entry[0], parseFloat(entry[1])])
        );


        const item = JSON.stringify(query)
            .replace(/"gte":/g, '"$gte":')
            .replace(/"lte":/g, '"$lte":');

        const coppiedQuery = JSON.parse(item);

        this.base = this.base.find({ price: { ...coppiedQuery } })
        return this;
    }

    paginator(resultPerPage) {
        const page = this.basequery.page || 1;
        const skipper = (page - 1) * resultPerPage
        this.base = this.base.find().skip(skipper).limit(resultPerPage);
        return this;
    }
}

module.exports = WhereClause;