import { useState } from "react";
import { Pagination } from "react-bootstrap"
import { useSearchParams } from "react-router-dom";
import CSS from 'csstype';

const paginationInput: CSS.Properties = {
    width:" 4.2rem",
};

const RestOfPagination = ({updatePage, numberOfPages, currentPage}: {updatePage: (pageToRedirect?: string) => void, 
    numberOfPages: number, currentPage: number}): JSX.Element => {
    let elements: JSX.Element[] = [];
        // if there only 5 pages we show them all
        if( numberOfPages<=5 ){
            for(let i=2; i <= numberOfPages-1; i++){
                elements.push(<Pagination.Item  key={`${i} page`} 
                    active={currentPage===i} onClick={()=>updatePage(i.toString())}>{i}</Pagination.Item>);
            }
        }
        else{
            // we add second element there if current page is not in neighborhood         
            if(currentPage>3){               
                elements.push(<Pagination.Item className={"hide-on-small-screens"} key={`${2} page`} 
                    active={currentPage===2} onClick={()=>updatePage("2")} >{2}</Pagination.Item>);
                if(currentPage!==4) elements.push(<Pagination.Ellipsis key={`${1} elipse`} className={"hide-on-small-screens"}/>)
            }
            
            //we add left neighbour when current page is not next or is page 1
            if(currentPage>2){
                elements.push(<Pagination.Item className={"hide-on-small-screens"} key={`${currentPage-1} page`} 
                    active={currentPage===2} onClick={()=>updatePage((currentPage-1).toString())} >{currentPage-1}</Pagination.Item>) 
            }

            //if current page is not last or first we show it
            if(currentPage!==1 && currentPage!==numberOfPages){
                elements.push(<Pagination.Item key={`${currentPage} page`} 
                    active={true} onClick={()=>updatePage((currentPage).toString())}>{currentPage}</Pagination.Item>) 
            }  

            //we show right neighbour if there is atleast 3 pages of diffrence beetwean current and last page number 
            if(currentPage<numberOfPages-1){
                elements.push(<Pagination.Item className={"hide-on-small-screens"} key={`${currentPage+1} page`} 
                    active={false} onClick={()=>updatePage((currentPage+1).toString())}>{currentPage+1}</Pagination.Item>) 
            }
            if(currentPage<numberOfPages-3)elements.push(<Pagination.Ellipsis key={`${2} elipse`} className={"hide-on-small-screens"}/>)
            //we show second to last, if it wasnt shown as neighbour
            if(currentPage<numberOfPages-2){
                elements.push(<Pagination.Item className={"hide-on-small-screens"} key={`${numberOfPages-1} page`} 
                    active={false} onClick={()=>updatePage((numberOfPages-1).toString())}>{numberOfPages-1}</Pagination.Item>);
            }
            // we show dots if there is some space left
            
        }  
        
        return(
            <>
                {elements}
            </>
        )
         
}

const PaginationComponent  = ({numberOfPages, currentPage}: {numberOfPages: number, currentPage: number}): JSX.Element => {
    const[newPage, setNewPage] = useState("")
    const [searchParams, setSearchParams] = useSearchParams();
    
    const updatePage = (pageToRedirect = newPage) => {
        if(pageToRedirect==="") return

        searchParams.set("page", pageToRedirect)
        setSearchParams(searchParams)

    }
    
    const handleKeypress = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        //it triggers by pressing the enter key without shift
        if (e.key=== 'Enter' ) updatePage()
    }

    const changePage = (page: string) => {
        if(page==="")setNewPage("")
        
        let reg = new RegExp(/[0-9]|\./);
        if(!reg.test(page))return

        if(parseInt(page)>numberOfPages) page = numberOfPages.toString()
        setNewPage(page)
    }
    
    return (
        <Pagination >
            <Pagination.Prev disabled={currentPage===1} onClick={()=>updatePage((currentPage-1).toString())}/>
            <Pagination.Item active={currentPage===1}  onClick={()=>updatePage("1")}>{1}</Pagination.Item>
            <RestOfPagination updatePage={updatePage} numberOfPages={numberOfPages} currentPage={currentPage}/>
            <Pagination.Item hidden={numberOfPages<=1} active={currentPage===numberOfPages}   onClick={()=>updatePage(numberOfPages.toString())}>{numberOfPages}</Pagination.Item>
            <Pagination.Next disabled={currentPage===numberOfPages}  onClick={()=>updatePage((currentPage+1).toString())} />
            <input onKeyDown={(e)=>handleKeypress(e)} type={"number"}  maxLength={4} value={newPage} onChange={(e)=>changePage(e.target.value)} style={paginationInput}></input>
        </Pagination>

    )      
}

export default PaginationComponent