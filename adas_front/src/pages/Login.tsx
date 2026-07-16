import { App, Button, Form, Input } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "@/services/authApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/slices/authSlice";

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [signInForm] = Form.useForm();

  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();

  //   functions
  const handleSignIn = async (values: any) => {
    try {
      const response = await login({
        username: values.login,
        password: values.password,
      }).unwrap();
      dispatch(
        setCredentials({
          user: response.user,
          accessToken: response.accessToken,
        }),
      );
      localStorage.setItem("refreshToken", response.refreshToken);

      message.success(t("success_login"));
      navigate("/");
    } catch (error) {
      console.error(error);
      message.error(t("error") || "Login failed");
    }
  };

  return (
    <section className="w-full h-screen flex items-center justify-center">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <div className="size-40">
          <img
            src="/assets/images/logo.png"
            alt="logo"
            className="size-full object-contain"
          />
        </div>
        <h1 className="text-headerColor text-3xl font-semibold text-center text-balance">
          {t("login")}
        </h1>
        <Form
          id="filtersForm"
          form={signInForm}
          layout="vertical"
          onFinish={handleSignIn}
          className="w-full grid grid-cols-12 gap-4"
        >
          <Form.Item
            name="login"
            className="col-span-12 m-0"
            label={t("login")}
            rules={[
              {
                required: true,
                message: t("required_field"),
              },
            ]}
          >
            <Input className="w-full" size="large" allowClear />
          </Form.Item>
          <Form.Item
            name="password"
            className="col-span-12 m-0"
            label={t("password")}
            rules={[
              {
                required: true,
                message: t("required_field"),
              },
            ]}
          >
            <Input.Password className="w-full" size="large" allowClear />
          </Form.Item>

          <Button
            htmlType="submit"
            className="col-span-12 m-0"
            type="primary"
            size="large"
            loading={isLoading}
          >
            {t("login")}
          </Button>
        </Form>
      </div>
    </section>
  );
};

export default Login;
