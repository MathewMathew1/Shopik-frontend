import { Order } from "../../types/types";
import { getDateFromOffset } from "../../helpers/functions";

const OrderCompleted = ({order}:{order: Order}) => {


    return (
        <div className="order-report">
           <div>OrderID </div> <div>{order.id}</div>
           <div>Delivered on </div><div>{getDateFromOffset(order.details.completeDate!)}</div>
           <div>Address </div><div>{order.address}</div>
           <div>Items</div>
           <div> 
                {order.orderedItems.map((value, index) => {
                    return(
                        <div key={`${index} item`}>{value.amount} {value.item.name}</div>
                    )
                })} 
            </div>
        </div>
    );
}

export default OrderCompleted;