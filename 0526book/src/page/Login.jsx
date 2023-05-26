import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import style from '../sass/login.module.scss'
import { auth } from '../database/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { userLogin } from '../slice/useSlice';

export default function Login() {

  const dispatch = useDispatch();
  const navigate = useNavigate('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const createEmail = (e) => {
    e.preventDefault();
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // 회원가입에 성공했을 때
        const user = userCredential.user;
        console.log(user)
        dispatch(userLogin(
            {
                uid : user.uid,
                email : user.email,
                displayName : user.displayName,
            }
        ))
        alert('회원가입에 성공했습니다. 홈으로 돌아갑니다.');
        navigate('/');
    })
    .catch((error) => {
        // 회원가입에 실패했을 때
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage)
        if(errorCode ==='auth/email-already-in-use') {
            alert('동일한 이메일이 이미 존재합니다.')
        }
        else if (errorCode ==='auth/weak-password') {
            alert('비밀번호는 6자리 이상으로 설정해 주세요.')
        }
        else {
            alert('로그인에 실패했습니다')
        }
    });
  }

  const onLogin = () => {
    async function getLogin() {
      try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          console.log(user);
          dispatch(userLogin(
              {
                  uid : user.uid,
                  email : user.email,
                  displayName : user.displayName,
              }
          ))
          navigate('/');
      }
      catch (error) {
          console.log(error.code, error.message);
          if ( error.code === "auth/user-not-found"
              || error.code === "auth/wrong-password") {
                  alert('없는 이메일이거나 비밀번호가 잘못되었습니다')
          }
          else {
              alert('로그인에 실패했습니다')
          }
      }
  }
  getLogin();
  }

  return (
    <div className={`${style}`}>
        <Link to='/' style={{color:'#3C486B', fontSize:'1.5rem'}}>
          <h3 className='m-2'>Reading Books 컬렉션</h3>
        </Link>
        <div className={`${style.login}`}>
          <h1 className='p-2'>로그인 및 회원가입</h1>
          <form action="" className='p-2' style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
            <label htmlFor="">이메일</label>
            <input type="email" onChange={(e)=>(setEmail(e.target.value))} className={style.input}/>
            <label htmlFor="">비밀번호</label>
            <input type="password" onChange={(e)=>(setPassword(e.target.value))} className={style.input}/>
            <div style={{display:'flex'}}>
              <button type="submit" className={style.button}
                onClick={createEmail}
              >회원가입</button>
              <button type="button" className={style.button}
                onClick={onLogin}
              >로그인</button>
            </div>
          </form>
        </div>
    </div>
  )
}
