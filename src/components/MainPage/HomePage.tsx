
import { Spinner, Button } from 'react-bootstrap';
import ShopItemCard from '../Shop/ShopItemCard';
import useArray from '../../customHooks/useArray';
import { ShopItem, AdditionalParameters } from '../../types/types';
import { SHOP_ITEMS_ROUTE } from '../../helpers/routes';
import { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import { SeasonEnum } from '../../types/types';
import { useSearchParams } from 'react-router-dom';
import PaginationComponent from './Pagination';;

const NAME_TO_MATCH_PARAM = "nameToMatch"
const SEASON_TO_MATCH_PARAM = "seasonToMatch"
const SORT_PARAM = "sortAscending"
const PAGE_PARAM = "page"
const AMOUNT_OF_ITEMS_PER_PAGE = 10

const HomePage = () => {
    const shopItems = useArray<ShopItem>([])
    const [isDataLoaded, setIsDataLoaded] = useState(false)
    const [seasonToMatch, setSeasonToMatch] = useState<SeasonEnum>(SeasonEnum.Any)
    const [nameToMatch, setNameToMatch] = useState("")
    const [sortAscending, setSortAscending] = useState(false)
    const [searchParams, setSearchParams] = useSearchParams();
    const [amountOfPages, setAmountOfPages] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)
    
    const controller = new AbortController()
    
    useEffect(() => {
        document.title = `Shopik HomePage`    
    }, []);

    useEffect(() => {
        let nameToMatchParam = searchParams.get(NAME_TO_MATCH_PARAM)
        if(nameToMatchParam) setNameToMatch(nameToMatchParam)
        else nameToMatchParam = nameToMatch

        
        let seasonToMatchParam = searchParams.get(SEASON_TO_MATCH_PARAM)
        if(seasonToMatchParam) setSeasonToMatch(seasonToMatchParam as SeasonEnum)
        else seasonToMatchParam = seasonToMatch
    

        let sort = searchParams.get(SORT_PARAM)==='true'
        setSortAscending(sort)


        let pageString = searchParams.get(PAGE_PARAM)
        let pageNumber: number
        if(pageString){
            pageNumber = parseInt(pageString)
            setCurrentPage(pageNumber)
        }
        else{
            pageNumber = currentPage
        }

        searchForItems(nameToMatchParam, seasonToMatchParam as SeasonEnum, sort, pageNumber)

        return () => {
            controller.abort()
        }    
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams.get("page")]);

    const searchForItems = (name: string, season: SeasonEnum, sort: boolean, page: number): void => {
        const { signal } = controller
        
        const additionalParameters: AdditionalParameters = {
            sortAscending: sort,
            page: page,
            limit: AMOUNT_OF_ITEMS_PER_PAGE
        }
        
        if(name!=="") additionalParameters.nameToMatch = name
        if(season!==SeasonEnum.Any) additionalParameters.seasonToMatch = season

        setIsDataLoaded(false)

        fetch(SHOP_ITEMS_ROUTE({...additionalParameters, page: page, limit: AMOUNT_OF_ITEMS_PER_PAGE}),{
            method: "GET",
            signal,
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            }})
            .then(response => response.json())
            .then(response => {
                if(!("error" in response)){
                    console.log(response.amountOfItems)
                    setAmountOfPages(Math.ceil(response.amountOfItems/AMOUNT_OF_ITEMS_PER_PAGE))

                    setSearchParams({...searchParams, ...additionalParameters})
                    var items: ShopItem[] = response.items
                    shopItems.set(items)           
                }
            })
            .finally(()=>setIsDataLoaded(true))
            .catch(error=>{console.log(error)})
    }

    return(
        <div >
            <div className="select-area">
                <div>
                    <Form.Select value={seasonToMatch} onChange={(e)=>setSeasonToMatch(e.target.value as SeasonEnum)} aria-label="Default select example">
                        {Object.keys(SeasonEnum).map((value, index) => {
                                return(
                                    <option key={`${index} option`} value={value}>{value}</option>
                                )
                            })}
                    </Form.Select> 
                </div>
                <div >
   
                    <Form.Select value={sortAscending.toString()} onChange={(e)=>setSortAscending(e.target.value==="true")} aria-label="Default select example">                 
                        <option value={"true"}>Sort: Asc</option>
                        <option value={"false"}>Sort: Desc</option>
                    </Form.Select> 
                </div>         
                <div>
                    <Form.Control value={nameToMatch} onChange={(e)=>setNameToMatch(e.target.value)} type="text" placeholder="name to match" />
                </div>
                <Button onClick={()=>searchForItems(nameToMatch, seasonToMatch, sortAscending, currentPage)} >Search</Button>
            </div>       
            {!isDataLoaded?
                <div className='centered' >
                    <Spinner animation="border" variant="primary" style={{height: "10rem", width: "10rem"}} />
                </div>
            :
            <>
                <div className='shop_items_flex'>
                    {
                        shopItems.array.length > 0?
                            <>
                                {shopItems.array.map((value, index) => {
                                    return(
                                        <ShopItemCard key={index} shopItem={value}/>
                                    )
                                })}
                                
                            </>
                        :
                        <h4>No results for this search</h4>       
                    }
                </div>
                <div className='flex-column margin-top-bg'>
                   <PaginationComponent currentPage={currentPage} numberOfPages={amountOfPages}/>
                </div>
                </>
            }
        </div>
    )
}

export default HomePage