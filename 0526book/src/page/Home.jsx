// 1. 책 이름, 작가 이름 입력
// 2. 입력 시 startDate 자동 입력
// 3. 메모 작성 기능 open.
// 4. 메모 작성 후 done이 true 되며 읽기 완료 표시 (endDate)
// 5. 로그인 기능

import style from '../sass/home.module.scss';

import { Timestamp, addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";

import { auth, db } from "../database/firebase";
import { signOut } from 'firebase/auth';

import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { userLogout } from '../slice/useSlice';
import AddBook from '../components/AddBook';

export default function Home() {
    // book list
    const [bookList, setBookList] = useState();
    // 입력 값
    const [inputTitle, setInputTitle] = useState('');
    const [inputWriter, setInputWriter] = useState('');
    const [inputMemo, setInputMemo] = useState('');
    // 모달창 상태
    const [openModal, setOpenModal] = useState(false);
    const [modalId, setModalId] = useState('');
    const [modalTitle, setModalTitle] = useState('');
    // 책 제목 검색
    const [searchTitle, setSearchTitle] = useState(''); 
    const [searchList, setSearchList] = useState();
    // filter 
    const [filterState, setFilterState] = useState('all'); 
    const [blue, setBlue] = useState(false); 
    const [red, setRed] = useState(false); 

    const user = useSelector((state)=>(state.user.user));
    const dispatch = useDispatch();

    // 첫 페이지 데이터 불러오기
    useEffect(() => {
        console.log(user);
        getData();
    }, [])

    // readingbooks Data 불러오기
    async function getData() {
        // const querySnapshot = await getDocs(collection(db, "readingbooks"));
        // 시간순 정렬 위해 query로 가져오기 >> orderBy로 오름차순 내림차순 가능
        const querySnapshot = await getDocs(query((collection(db, "readingbooks")), orderBy("startDate", "desc")));
        
        // 가져온 컬렉션의 문서배열을 새로운 배열을 만들어서 저장
        let dataArray = [];
        querySnapshot.forEach((doc) => {
            dataArray.push({
                id: doc.id,
                ...doc.data()
            });
        });
        console.log(dataArray)

        if (blue) {
            setBookList(dataArray.filter((d)=>(d.done===true)));
        } else if (red) {
            setBookList(dataArray.filter((d)=>(d.done===false)));
        } else {
            setBookList(dataArray);
        }
    }

    // return 화면에 값을 출력하기 위한 함수
    // 타임 스탬프 값을 넣으면 값을 변환해서 문자열로 return 하는 함수
    const printTime = (date) => {
        const month = date.toDate().getMonth()+1;
        const day = date.toDate().getDate();

        return `${month} / ${day}`
    }

    // 책 삭제 (id값 비교)
    const deleteBook = async (id) => {
        await deleteDoc(doc(db, "readingbooks", id));
        getData();
    }

    // 감상 메모 추가 (doc 수정)
    const addMemo = async () => {
        // 변경하고 싶은 값에 f2 누르면 일괄 변경 가능
        const memoRef = doc(db, "readingbooks", modalId);
        console.log(modalId)
        await updateDoc(memoRef, {
            done: true,
            memo: inputMemo,
            endDate: Timestamp.fromDate(new Date()),
        });
        setInputMemo('');
        setOpenModal(!openModal);
        getData();
    }

    // 책 검색 기능 (정확한 책 제목 - 단순 쿼리)
    const searchBook = async () => {
        const bookRef = collection(db, "readingbooks");

        const q = query(bookRef, where("title", "==", searchTitle));
        const querySnapshot = await getDocs(q);

        let dataArray = [];
        querySnapshot.forEach((doc) => {
            dataArray.push({
                id: doc.id,
                ...doc.data()
            });
        });
        console.log(dataArray)
        setSearchList(dataArray);
    }

    // 감상문 modal 토글
    const toggleModal = (book) => {
        setOpenModal(!openModal);
        setModalId(book.id);
        setModalTitle(book.title);
    }

    // 로그아웃
    const logout = () => {
        signOut(auth).then(() => {
            // Sign-out successful.
            dispatch(userLogout());
        }).catch((error) => {
            console.log(error);
        });
    }

    return (
        <div className={style}>
            {
                user ?
                <div style={{display:'flex', justifyContent:'flex-end', alignItems:'center', padding:'5px 10px'}}>
                    <h3>{user.email}님이 로그인했습니다.</h3>
                    <button onClick={()=>logout()} className='button' style={{marginLeft:'10px'}}>로그아웃</button>
                </div>
                :
                <Link to='/login' style={{color:'#3C486B', fontSize:'1.2rem', display:'flex', justifyContent:'flex-end', alignItems:'center'}}>로그인</Link>
            }
            <h3 className='m-2'>🔳 Reading Books 컬렉션 🔳</h3>
            <h1 className='m-2'>책 추가</h1>
            <AddBook getData={getData} />
            <div className={`${style.searchbook} p-3`}>
                <input type="text" onChange={(e)=>(setSearchTitle(e.target.value))} />
                <button
                    onClick={searchBook} className={`ml-1 ${style.addbtn}`}
                >읽은 책 검색하기</button>
            </div>
            <div>
                <ul className={style.searchul}>
                    {
                        searchList && 
                        searchList.map((book) =>
                        <li key={book.id} className={`${style.searchlist}`}>
                            <div className={style.booktitle}>
                                {
                                    book.done ?
                                        <h5 className={`${style.book} br-2`} style={{width:'70px'}}>완독</h5>
                                        : <h5 className={`${style.book} br-2`} style={{width:'70px'}}>읽는 중</h5>}
                                <h3>{book.title}</h3>
                                <h4>{book.writer}</h4>
                            </div>
                            {
                                book.memo ?
                                <h4 className={`textgrey`}>{book.memo}</h4>
                                : <h4 className={`textgrey`}>메모 없음</h4>
                            }
                        </li>
                        )
                    }
                </ul>
            </div>
            <div>
                <div style={{textAlign:'left', minWidth:'800px', maxWidth:'60vw', margin:'15px auto 0 auto', display:'flex'}}>
                    <span style={{fontSize:'0.8rem'}}>필터&nbsp;&nbsp;</span>
                    <label className={blue?`${style.bluebtn} onbtn`:style.bluebtn}
                        onClick={()=>{setBlue(!blue); getData();}}/>
                    <label className={style.redbtn}
                        onClick={()=>{setRed(!red); getData();}}/>
                </div>
                <ul>
                    {
                        bookList && bookList.map((book) =>
                            <li key={book.id} className={`${style.booklist} br-2 m-a mtb-2 p-2`}>
                                <div style={{position:'relative'}}>
                                    <div className={style.booktag}>
                                        <div className={`${style.book} br-2`} style={book.done ? {backgroundColor:'#3C486B'} : {backgroundColor:'#F45050'}}>
                                            <h4>{printTime(book.startDate)} ~</h4>
                                            {
                                                book.done ?
                                                    <h4>&nbsp;
                                                        {printTime(book.endDate)}
                                                    </h4>
                                                    : <h4>&nbsp;읽는 중</h4>}
                                        </div>
                                        <button onClick={() => (deleteBook(book.id))} className={`${style.xbutton}`}>✖</button>
                                    </div>
                                    <div className={`${style.bookexpain}`}>
                                        <div className={`${style.booktitle}`}>
                                            <h2>{book.title}</h2>
                                            <h4>{book.writer}</h4>
                                        </div>
                                        {
                                            book.memo ?
                                            <h4 className='ml-05 textgrey'>
                                                {book.memo}
                                            </h4>
                                            :
                                            <button className='button ml-05'
                                                onClick={() => {toggleModal(book)}}
                                            >감상문 적기</button>
                                        }
                                    </div>
                                </div>
                            </li>
                        )
                    }
                    {
                        // 모달창 공간
                        openModal &&
                        <div style={{position:'fixed', right:'0', top:'0',
                            display:'flex', flexDirection:'column', justifyContent:'space-evenly', alignItems:'center'}} className={style.modal}>
                            <h3>{modalTitle} 감상문 적기</h3>
                            <textarea cols="60" rows="50"
                                value={inputMemo}
                                onChange={(e) => (setInputMemo(e.target.value))} />
                            <br />
                            <button onClick={()=>addMemo()} className='button'>메모 추가</button>
                        </div>
                    }
                </ul>
            </div>
        </div>
    );
}
