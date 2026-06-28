import{a as e}from"./index-CcB7F1xI.js";const o={getAll(){return e.get("/orders")},getById(r){return e.get(`/orders/${r}`)},checkout(r){return e.post("/checkout",{shipping_address:r})}};export{o};
