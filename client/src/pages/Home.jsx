import React , {useEffect, useReducer, useState} from 'react'
import axios from 'axios'
import Loader from '../components/Loader'
import { toast } from 'react-toastify'
let minimumDelay

// ACTIONS 
function update(state, action) {
    switch(action.type){
        case 'FETCH_START': 
            return {...state, loader : true , error : null}
        case 'FETCH_SUCCESS':
            return {...state, loader : false, error : null , photos : [...state.photos,  ...action.payload]}
        case 'FETCH_ERROR':
            return {...state, loader : false , error : action.payload}
        case 'SEARCH_VALUE':
            return {...state, search : action.payload , isSearch : true}
        case 'CALL_SEARCH':
            return {...state, isSearch : true}
        case 'END_SEARCH':
            return {...state, isSearch : false, search : ""}
        case 'ADD_FAV':
            return {...state, fav : [...state.fav , action.payload]}
        case 'REMOVE_FAV':
            return {...state, fav : [...state.fav.filter(item => item.id != action.payload)]}
        case 'FETCH_FAV':
            return {...state, fav : action.payload}
        case 'CALL_FAV':
            return {...state, isFavCall : true};
        case 'END_FAV':
            return {...state, isFavCall : false};
        default :
            return state;
    }
}

export default function Home() {

    // INITIAL DATA FOR USEREDUCER
    const initialState = {
        photos : [],
        loader : false,
        error : null,
        search : "",
        isSearch : false,
        fav : [],
        isFavCall : false
    }

    const ACTION = {
        FETCH_START : "FETCH_START",
        FETCH_SUCCESS : "FETCH_SUCCESS",
        FETCH_ERROR : "FETCH_ERROR",
        SEARCH_CHANGE : "SEARCH_VALUE",
        CALL_SEARCH : "CALL_SEARCH",
        END_SEARCH : "END_SEARCH",
        ADD_FAV : "ADD_FAV",
        REMOVE_FAV : "REMOVE_FAV",
        FETCH_FAV : "FETCH_FAV",
        CALL_FAV : "CALL_FAV",
        END_FAV : "END_FAV"
    }

    // VARIABLES 
    const [state, dispatch] = useReducer(update,initialState)
    const [page, setPage] = useState(2)

    // Fetching data for the first load 
    const fetchInitial = async () => {
        try {
            // For showing the loading animation
            dispatch({type : ACTION.FETCH_START})
            minimumDelay = new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds

            // API call
            const res = await axios.get(`https://picsum.photos/v2/list?page=${page}&limit=30`);
            await Promise.all([res, minimumDelay]);

            if(res.status == 200){
                toast.success("Successfully Fetched data")
                dispatch({type : ACTION.FETCH_SUCCESS, payload : res.data})
            }else{
                toast.error("Failed to fetch data from server")
                dispatch({type : ACTION.FETCH_ERROR, payload : "Data not transfered"})
            }
            // Update the page so that new images came 
            setPage(page+1)
        } catch (error) {
            toast.error(error.message)
            dispatch({type : ACTION.FETCH_ERROR,payload : "Data not transfered" })
        }
    }

    // Fetching the fav list from the local storage and if exist than store it in useReducer
    const fetchFav = () => {
        let existFav;
        JSON.parse(localStorage.getItem('fav')) ? existFav = JSON.parse(localStorage.getItem('fav')) : [{}]
        console.log("called existFav")

        if(!existFav){
            console.log("empty")
            return;
        }else{
            dispatch({type : ACTION.FETCH_FAV , payload : existFav})
            console.log(state.fav)
        }
    }

    const handleLoadMore = async () => {
        try {
            
            dispatch({type : ACTION.FETCH_START})
            minimumDelay = new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds
            const res = await axios.get(`https://picsum.photos/v2/list?page=${page}&limit=30`);
            await Promise.all([res, minimumDelay]);
            if(res.status == 200){
                const data = res.data
                dispatch({type : ACTION.FETCH_SUCCESS, payload : data})
            }else{
                dispatch({type : ACTION.FETCH_ERROR, payload : "Data not transfered"})
            }

            console.log(state)
            setPage(page+1)
            
        } catch (error) {
            dispatch({type : ACTION.FETCH_ERROR,payload : "Data not transfered" })
        }
    }

    const handleSearchChange = (e) => {
        e.target.value == "" ? dispatch({type : ACTION.END_SEARCH }) : dispatch({type : ACTION.SEARCH_CHANGE, payload : e.target.value})
    }

    const handleSearchKeyDown = (e) => {
        console.log(e.key)
        if(e.key === 'Enter'){
            console.log("inside if")
            dispatch({type : ACTION.CALL_SEARCH})
        }
    }

    
    const handleAddFav = (item) => {
        console.log(state.fav.some(f => f.id === item.id))
        dispatch({type : ACTION.ADD_FAV , payload : item})
        console.log("dispatched")
        let existFav;
        JSON.parse(localStorage.getItem('fav')) ? existFav = JSON.parse(localStorage.getItem('fav')) : [{}]
        console.log("called existFav")
        if(!existFav){
            console.log("empty")
            localStorage.setItem('fav', JSON.stringify([...state.fav , item]));
            return;
        }
        localStorage.setItem('fav', JSON.stringify([...existFav, item]));
        console.log("stored to local storage")
    }

    const handleRemoveFav = (item) => {
        console.log(state.fav.some(f => f.id === item.id))
        dispatch({type : ACTION.REMOVE_FAV , payload : item.id})
        localStorage.setItem('fav', JSON.stringify([...state.fav.filter(itm => itm.id != item.id)]));
    }

    const handleLiked = () => {
        dispatch({type : ACTION.CALL_FAV})
    }

    const handleReturn = () => {
        dispatch({type : ACTION.END_FAV})
    }

    useEffect(()=>{
        page < 3 ? fetchInitial() : ()=>{} ;
        fetchFav();
        console.log("The below is the state.fav")
        console.log(state.fav)
    },[])

    return (
        <div className='min-h-screen h-auto w-screen bg-black text-white flex flex-col items-center justify-between  gap-4 py-5'>

            {/* Search box */}
            <div className='h-15 w-9/10 flex bg-white rounded-2xl items-center justify-between'>
                <input onKeyDown={handleSearchKeyDown}  onChange={handleSearchChange} className='h-full w-8/10 px-6 py-2 outline-none rounded-2xl active:outline-none border-none bg-white text-black text-xl font-normal' placeholder='Search by Author..' value={state.search} type="text" name="search" id="search" />
                <button onClick={handleLiked} className='h-full w-2/10 bg-red-400 text-2xl font-medium rounded-2xl cursor-pointer '>Your Favourite</button>
            </div>
            
            {/* NON-SEARCH items  */}
            {
                !state.isSearch && !state.isFavCall && <div className={`h-auto items-center justify-center flex-wrap grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 w-full p-5`}>
                {
                    state.photos.map((item, idx)=>(
                        <div id='card' key={idx} className={`h-[40vh] w-full bg-gray-700 rounded-lg flex flex-col items-center justify-between`}>
                            <img src={item.download_url} alt="img" className='w-full h-[80%] object-cover rounded-t-lg'/>
                            <div className='p-2 h-[20%] w-full text-2xl font-bold flex items-center justify-between'>
                                <div><p>{item.author}</p></div>
                                <div><label className='cursor-pointer text-red-500' htmlFor={item.id}>Like : <input onChange={(e)=>{ e.target.checked ? handleAddFav(item) : handleRemoveFav(item) }} checked={state.fav.some(f => f.id === item.id)} className='appearance-none h-6 w-6 border-2 border-red-400 rounded-md 
                checked:bg-red-400 checked:border-transparent 
                focus:outline-none transition duration-200' type='checkbox' id={item.id}></input> </label></div>
                            </div>
                        </div>
                    ))
                }
            </div>
            }

            {/* Searched items */}
            {
                state.isSearch && !state.isFavCall && <div className={`h-auto items-center justify-center flex-wrap grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 w-full p-5`}>
                {
                    state.photos.filter( i => i.author.toLowerCase().includes(state.search.toLowerCase())).map((item, idx)=>(
                        <div id='card' key={idx} className={`h-[40vh] w-full bg-gray-700 rounded-lg flex flex-col items-center justify-between`}>
                            <img src={item.download_url} alt="img" className='w-full h-[80%] object-cover rounded-t-lg'/>
                            <div className='p-2 h-[20%] w-full text-2xl font-bold flex items-center justify-between'>
                                <div><p>{item.author}</p></div>
                                <div><label className='cursor-pointer text-red-500' htmlFor={item.id}>Like : <input className='appearance-none h-6 w-6 border-2 border-red-400 rounded-md 
                checked:bg-red-400 checked:border-transparent 
                focus:outline-none transition duration-200' type='checkbox' id={item.id}></input> </label></div>
                            </div>
                        </div>
                    ))
                }
            </div>
            }

            {/* Liked List */}
            {
                state.isFavCall && <div className={`h-auto flex-col justify-center w-full `}>

                {/* Empty Fav */}{
                    state.fav.length <= 0 && <div className='font-black text-4xl flex items-center justify-center h-25 w-auto text-white'>Your Favourite Lise is Empty !!</div>
                }

                <div onClick={handleReturn} className='w-full flex justify-center'><button className='h-15 w-45 bg-gray-400 p-2 rounded-2xl font-bold items-center justify-center cursor-pointer flex'>Return </button></div>
                

                <div className={`h-auto items-center justify-center flex-wrap grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 w-full p-5`}>
                    {
                    state.fav.map((item, idx)=>(
                        <div id='card' key={idx} className={`h-[40vh] w-full bg-gray-700 rounded-lg flex flex-col items-center justify-between`}>
                            <img src={item.download_url} alt="img" className='w-full h-[80%] object-cover rounded-t-lg'/>
                            <div className='p-2 h-[20%] w-full text-2xl font-bold flex items-center justify-between'>
                                <div><p>{item.author}</p></div>
                                <div><label className='cursor-pointer text-red-500' htmlFor={item.id}>Like : <input onChange={(e)=>{ e.target.checked ? handleAddFav(item) : handleRemoveFav(item) }} checked={state.fav.some(f => f.id === item.id)} className='appearance-none h-6 w-6 border-2 border-red-400 rounded-md 
                checked:bg-red-400 checked:border-transparent 
                focus:outline-none transition duration-200' type='checkbox' id={item.id}></input> </label></div>
                            </div>
                        </div>
                    ))
                }
                </div>
            </div>
            }

            { state.loader && <Loader/>}
            {state.fav.length > 0 &&
                <button onClick={handleLoadMore} className='h-15 w-45 bg-green-400 p-2 rounded-2xl font-bold items-center justify-center cursor-pointer flex'>Load More</button>
            }
        </div>
    )
}
