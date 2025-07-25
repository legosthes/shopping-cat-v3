import { Notyf } from "notyf";
import "notyf/notyf.min.css";
import axios from "axios";

const notyf = new Notyf({
  duration: 2000,
  ripple: true,
  position: {
    x: "center",
    y: "top",
  },
});

const shoppingControl = () => {
  return {
    //data
    shoppingList: [],
    catList: [],
    //methods
    init() {
      this.fetchCatData();
      this.fetchShoppingList();
    },

    //計算總價
    get priceSum() {
      if (this.shoppingList.length != 0) {
        const price = this.shoppingList
          .map((cat) => cat.price * cat.count)
          .reduce((acc, cur) => acc + cur);
        const fee = this.shoppingList
          .map((cat) => cat.price * cat.count * 0.1)
          .reduce((acc, cur) => acc + cur);
        return price + fee;
      } else {
        return 0;
      }
    },

    fetchShoppingList: async function () {
      try {
        const shoppingJSON = "http://localhost:3002/shoppingCart";
        const resp = await axios.get(shoppingJSON);
        this.shoppingList = resp.data;
        console.log(this.shoppingList);
        console.log(resp.data);
      } catch {
        notyf.error(`無法取得購物車`);
      }
    },

    fetchCatData: async function () {
      const catJSON = "http://localhost:3002/cats";
      const resp = await axios.get(catJSON);
      this.catList = resp.data;
    },

    // 按認養新增
    addCatList: async function (cat) {
      try {
        const existingCatIndex = this.shoppingList.findIndex(
          (name) => name.name == cat.name
        );

        const shoppingCartJSON = "http://localhost:3002/shoppingCart";

        const catData = {
          id: cat.id,
          name: cat.name,
          price: cat.price,
          count: 1,
        };

        if (existingCatIndex >= 0) {
          //從exisiting的cats當中去找
          this.shoppingList[existingCatIndex].count += 1;

          const resp = await axios.patch(`${shoppingCartJSON}/${cat.id}`, {
            count: this.shoppingList[existingCatIndex].count,
          });
          console.log(resp);
        } else {
          this.shoppingList.push(cat);
          //幫他新增一個count
          cat.count = 1;
          const resp2 = await axios.post(shoppingCartJSON, catData);
          console.log(resp2);
        }
        notyf.success(`已加入認養清單`);
      } catch {
        notyf.error(`選取失敗`);
      }
    },

    // 手動調整數量按鈕時
    updateCatCount: async function (cat) {
      const existingCatIndex = this.shoppingList.findIndex(
        (name) => name.name == cat.name
      );

      try {
        const shoppingCartJSON = "http://localhost:3002/shoppingCart";
        const resp = await axios.patch(`${shoppingCartJSON}/${cat.id}`, {
          count: this.shoppingList[existingCatIndex].count,
        });
        notyf.success(`更新成功`);
      } catch {
        notyf.error(`更新失敗`);
      }
    },

    //清除認養清單
    clearShoppingCart: function () {
      if (confirm(`確定要全數清除嗎？`)) {
        try {
          const deleteAll = this.shoppingList.map((cat) => {
            axios.delete(`http://localhost:3002/shoppingCart/${cat.id}`);
          });
        } catch {
          notyf.error(`清除失敗`);
        }
        this.shoppingList = [];
      }
    },

    //清除認養清單個別項目
    deleteItem: function (cat) {
      const catIndex = this.shoppingList.findIndex(
        (name) => cat.name == name.name
      );
      if (confirm(`確定要刪除嗎？`)) {
        this.shoppingList.splice(catIndex, 1);

        try {
          const shoppingCartJSON = `http://localhost:3002/shoppingCart/${cat.id}`;
          const resp = axios.delete(shoppingCartJSON);
          notyf.success(`成功刪除`);
        } catch {
          notyf.error(`刪除失敗`);
        }
      }
    },
  };
};

export { shoppingControl };
