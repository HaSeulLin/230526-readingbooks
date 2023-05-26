// 1. 책 이름, 작가 이름 입력
// 2. 입력 시 startDate 자동 입력
// 3. 메모 작성 기능 open.
// 4. 메모 작성 후 done이 true 되며 읽기 완료 표시 (endDate)
// 5. 로그인 기능

import style from '../sass/home.module.scss';

import { Timestamp, addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { auth, db } from "../database/firebase";
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { userLogout } from '../slice/useSlice';
import { signOut } from 'firebase/auth';

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
    // 책 제목 검색
    const [searchTitle, setSearchTitle] = useState(''); 
    const [searchList, setSearchList] = useState();

    const user = useSelector((state)=>(state.user.user));
    const dispatch = useDispatch();

    // 첫 페이지 데이터 불러오기
    useEffect(() => {
        console.log(user);
        getData();
    }, [])

    // readingbooks Data 불러오기
    async function getData() {
        let dataArray = [];

        const querySnapshot = await getDocs(collection(db, "readingbooks"));
        querySnapshot.forEach((doc) => {
            dataArray.push({
                id: doc.id,
                ...doc.data()
            });
        });
        console.log(dataArray)
        setBookList(dataArray);
    }

    // 책 추가 - readingbooks Data 문서 추가
    const addBook = async () => {
        try {
            const docRef = await addDoc(collection(db, "readingbooks"), {
                done: false,
                memo: null,
                startDate: Timestamp.fromDate(new Date()),
                title: inputTitle,
                writer: inputWriter,
            });
            console.log("Document written with ID: ", docRef.id);
            setInputTitle(''); setInputWriter('');

            getData();
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    // 문서 삭제 (id값 비교)
    const deleteBook = async (id) => {
        await deleteDoc(doc(db, "readingbooks", id));
        getData();
    }

    // 메모 추가 (doc 수정)
    const addMemo = async () => {
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
            <div className={style.readtop}>
                <Link to='/'>
                    <h3 className='m-2'>🔳 Reading Books 컬렉션 🔳</h3>
                </Link>
                <h1 className='m-2'>책 추가</h1>
                <div className={style.addbook}>
                    <label htmlFor="">책 이름</label>
                    <input type="text" value={inputTitle}
                        onChange={(e) => (setInputTitle(e.target.value))} 
                        className='ml-1'/>
                    <label className='ml-2' htmlFor="">작가 이름</label>
                    <input type="text" value={inputWriter}
                        onChange={(e) => (setInputWriter(e.target.value))}
                        className='ml-1'/>
                    <button onClick={addBook} className={`${style.addbtn} ml-1`}>추가</button>
                </div>
            </div>
            <div className={`${style.searchbook} p-3`}>
                <input type="text" onChange={(e)=>(setSearchTitle(e.target.value))} />
                <button
                    onClick={searchBook} className={`button ml-1 ${style.searchbtn}`}
                >읽은 책 검색하기</button>
            </div>
            <div>
                <ul>
                    {
                        searchList && 
                        searchList.map((book) =>
                        <li key={book.id} className={`${style.searchlist} br-2`}>
                            <div>
                                {
                                    book.done ?
                                        <h3>읽기 완료</h3>
                                        : <h3>읽는 중</h3>}
                                <h3>{book.title}</h3>
                                <h4>{book.writer}</h4>
                            </div>
                            {
                                book.memo ?
                                <h4>{book.memo}</h4>
                                : <h4>메모 없음</h4>
                            }
                        </li>
                        )
                    }
                </ul>
            </div>
            <div>
                <ul>
                    {
                        bookList && bookList.map((book) =>
                            <li key={book.id} className={`${style.booklist} br-2 m-a mtb-2 p-2`}>
                                <div>
                                    <div className={style.booktag}>
                                        <div className={`${style.book} br-2`} style={book.done ? {backgroundColor:'#3C486B'} : {backgroundColor:'#F45050'}}>
                                            <h4>{`${book.startDate.toDate().getMonth() + 1} / ${book.startDate.toDate().getDate()} ~`}</h4>
                                            {
                                                book.done ?
                                                    <h4>&nbsp;
                                                        {`${book.endDate.toDate().getMonth() + 1} / ${book.endDate.toDate().getDate()}`}
                                                    </h4>
                                                    : <h4>&nbsp;읽는 중</h4>}
                                        </div>
                                        <button onClick={() => (deleteBook(book.id))} className={`button ${style.xbutton}`}>✖</button>
                                    </div>
                                    <div className={`${style.bookexpain}`}>
                                        <div className={`${style.booktitle}`}>
                                            <h2>{book.title}</h2>
                                            <h4>{book.writer}</h4>
                                        </div>
                                        {
                                            book.memo ?
                                            <h4>
                                                {book.memo}
                                            </h4>
                                            :
                                            <button  className='button'
                                                onClick={() => {setOpenModal(!openModal); setModalId(book.id);}}
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
                        <div style={{position:'fixed', right:'10vw', top:'30vh'}}>
                            <h3>감상문 적기</h3>
                            <textarea cols="50" rows="30"
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
