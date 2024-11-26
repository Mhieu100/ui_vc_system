import { useEffect, useState } from "react";
import { callLogin } from "../../config/api";
import { message, notification } from "antd";
import "./form.css";
import { useDispatch, useSelector } from "react-redux";
import { setUserLoginInfo } from "./../../redux/slice/accountSlide";

const LoginPage = () => {
  let params = new URLSearchParams(location.search);
  const callback = params?.get("callback");

  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.account.isAuthenticated);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = "/";
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await callLogin(email, password);
    if (res?.data) {
      localStorage.setItem("access_token", res.data.access_token);
      dispatch(setUserLoginInfo(res.data.user));
      message.success("Đăng nhập tài khoản thành công!");
      window.location.href = callback ? callback : "/";
    } else {
      notification.error({
        message: "Đăng nhập thất bại",
        description:
          res.message && Array.isArray(res.message)
            ? res.message[0]
            : res.message,
        duration: 5,
      });
    }
  };

  return (
    <div className="text-center mt-5">
      <form className="form-signin" onSubmit={handleSubmit}>
        <img
          className="mb-4"
          src="https://getbootstrap.com/docs/4.0/assets/brand/bootstrap-solid.svg"
          alt=""
          width="72"
          height="72"
        />
        <h1 className="h3 mb-3 font-weight-normal">Đăng nhập</h1>
        <label htmlFor="inputEmail" className="sr-only">
          Email address
        </label>
        <input
          type="email"
          id="inputEmail"
          className="form-control"
          placeholder="Email address"
          // required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="inputPassword" className="sr-only">
          Password
        </label>
        <input
          type="password"
          id="inputPassword"
          className="form-control"
          placeholder="Password"
          // required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn btn-primary btn-block mt-3" type="submit">
          Submit
        </button>
        <p className="mt-3 text-muted">
          Chưa có tài khoản ! <a href="/register">Đăng ký</a>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;