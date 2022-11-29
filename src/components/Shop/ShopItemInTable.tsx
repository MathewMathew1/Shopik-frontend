import { CartItem } from "../../types/types";

const ShopItemInTable = ({index, shopItem}:{index: number, shopItem: CartItem}) => {
    return (
        <tr>
            <td><img src={shopItem.item.imageFilePath} alt="12313" height="100px"></img></td>
            <td className='description-table' style={{paddingLeft: "10px", paddingRight: "10px"}}>
                <a href={`/ShopItem/${shopItem.item.id}`} style={{display: "block"}} className='info-header'>{shopItem.item.name}</a>
                <span >{shopItem.item.description}</span>

            </td>

            <td>{shopItem.amount}</td>
            <td className='info-header'>{shopItem.item.price}$</td>
            <td className='info-header'>{shopItem.item.price * shopItem.amount}$</td>
        </tr>
    );
}

export default ShopItemInTable;