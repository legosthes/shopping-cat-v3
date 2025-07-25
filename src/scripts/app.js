import "@fortawesome/fontawesome-free/css/all.css";
import Alpine from "alpinejs";
import { shoppingControl } from "./shopping_cart";

window.Alpine = Alpine;
Alpine.data("shopping_form", shoppingControl);

Alpine.start();
// 實作寫在這裡！
