import React, { useState } from 'react'
import style from '../sass/home.module.scss';
import { Timestamp, addDoc, collection } from 'firebase/firestore';
import { db } from '../database/firebase';

export default function AddBook({getData}) {
    
    // 입력 값
    const [inputTitle, setInputTitle] = useState('');
    const [inputWriter, setInputWriter] = useState('');

    // 책 추가 - readingbooks Data 문서 추가
    const addBook = async (e) => {
        e.preventDefault();
        try {
            // try 안에 작성하는 내용은 서버와 연결하고,
            // 서버에서 받아온 값을 활용하는 내용
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

    return (
    <div className={style.readtop}>
        <form onSubmit={addBook} className={style.addbook}>
            <label htmlFor="">책 이름</label>
            <input type="text" value={inputTitle}
                onChange={(e) => (setInputTitle(e.target.value))} 
                className='ml-1'/>
            <label className='ml-2' htmlFor="">작가 이름</label>
            <input type="text" value={inputWriter}
                onChange={(e) => (setInputWriter(e.target.value))}
                className='ml-1'/>
            <button type='submit' className={`${style.addbtn} ml-1`}>추가</button>
        </form>
    </div>
  )
}
