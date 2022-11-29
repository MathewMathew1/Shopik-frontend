import './App.css';
import SnackbarProvider from './contexts/SnackBarContext';
import UserProvider from './contexts/UserContext';
import SnackBars from './components/MainPage/SnackBars';
import NavbarComponent from './components/MainPage/Navbar';
import { Routes, Route} from "react-router-dom";
import HomePage from './components/MainPage/HomePage';
import ShopItemComponent from './components/Shop/ShopItemComponent';
import CartProvider from './contexts/CartContext';
import CartItems from './components/Shop/CartItems';
import Payment from './components/Shop/Payment';
import ListOrders from './components/User/ListOrders';


function App() {

  return (
    <div className="App">
      <div className='body-el'>
        <SnackbarProvider>
          <UserProvider>
            <CartProvider>
              <NavbarComponent/>
              <Routes>
                <Route path="/" element={<HomePage />}/>
                <Route path="/shopItem/:id" element={<ShopItemComponent/>}/>
                <Route path="/cardItems" element={<CartItems/>}/>
                <Route path="/payment" element={<Payment/>}/>
                <Route path="/user/orders" element={<ListOrders/>}/>
              </Routes>
              <SnackBars></SnackBars>
            </CartProvider>   
          </UserProvider>
        </SnackbarProvider>
      </div>
      <div className="footer-basic">
        <footer>
            
            <span>Contact: 91 213 231 22</span>
            <p className="copyright">Shopik © 2022</p>
        </footer>
      </div>

    </div>
  );
}

export default App;
