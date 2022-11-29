import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button';
import { ShopItem } from '../../types/types';
import { Cart} from '../../helpers/Icons';
import { useUpdateCart } from '../../contexts/CartContext';

const ShopItemCard = ({shopItem}: {shopItem: ShopItem}) => {
    const updateCart = useUpdateCart()
    
    return(
        <Card style={{ width: '18rem' }}>
            <Card.Img alt={shopItem.name} style={{height: "250px"}} variant="top" src={shopItem.imageFilePath} />
            <Card.Body>
                <Card.Title>{shopItem.name}</Card.Title>
                <Card.Text>
                    {shopItem.description}
                </Card.Text>

                
            </Card.Body>
            <Card.Body className='cart-bottom'>
         
                    <div>Price: {shopItem.price}$</div>
                    <div>
                        Rating: 
                        {shopItem.averageRating===null? 0: shopItem.averageRating}
                        <span style={{fontSize: "0.9rem"}}>({shopItem.amountOfRatings===null? 0: shopItem.amountOfRatings})</span>
                    </div>    
                    <Button onClick={()=>updateCart.addItemToCart(shopItem, 1)} variant="primary">Add To Card <Cart/></Button>
                    <Button variant="warning" as="a" href={`/ShopItem/${shopItem.id}`}>Check Details</Button>
               
            </Card.Body>
        </Card>
    )
}

export default ShopItemCard