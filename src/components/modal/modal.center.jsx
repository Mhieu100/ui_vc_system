/* eslint-disable react/prop-types */
import {
  FooterToolbar,
  ModalForm,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";
import {
  Col,
  ConfigProvider,
  Form,
  message,
  Modal,
  notification,
  Row,
  Upload,
} from "antd";
import { useState } from "react";
import {
  callCreateCenter,
  callUpdateCenter,
  callUploadSingleFile,
} from "../../config/api";
import {
  CheckSquareOutlined,
  LoadingOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import enUS from "antd/es/calendar/locale/en_US";
import { v4 as uuidv4 } from "uuid";
import "../../styles/reset.scss";

const ModalCenter = (props) => {
  const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [animation, setAnimation] = useState("open");
  //   const [value, setValue] = useState("");
  const [form] = Form.useForm();
  const [dataLogo, setDataLogo] = useState([]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  const handlePreview = async (file) => {
    if (!file.originFileObj) {
      setPreviewImage(file.url);
      setPreviewOpen(true);
      setPreviewTitle(
        file.name || file.url.substring(file.url.lastIndexOf("/") + 1)
      );
      return;
    }
    getBase64(file.originFileObj, (url) => {
      setPreviewImage(url);
      setPreviewOpen(true);
      setPreviewTitle(
        file.name || file.url.substring(file.url.lastIndexOf("/") + 1)
      );
    });
  };

  const handleRemoveFile = () => {
    setDataLogo([]);
  };

  const handleChange = (info) => {
    if (info.file.status === "uploading") {
      setLoadingUpload(true);
    }
    if (info.file.status === "done") {
      setLoadingUpload(false);
    }
    if (info.file.status === "error") {
      setLoadingUpload(false);
      message.error(
        info?.file?.error?.event?.message ?? "Đã có lỗi xảy ra khi upload file."
      );
    }
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must smaller than 2MB!");
    }
    return isJpgOrPng && isLt2M;
  };

  const handleUploadFileLogo = async ({ file, onSuccess, onError }) => {
    const res = await callUploadSingleFile(file, "center");
    if (res && res.data) {
      setDataLogo([
        {
          name: res.data.fileName,
          uid: uuidv4(),
        },
      ]);
      if (onSuccess) onSuccess("ok");
    } else {
      if (onError) {
        setDataLogo([]);
        const error = new Error(res.message);
        onError({ event: error });
      }
    }
  };

  const handleReset = async () => {
    form.resetFields();
    // setValue("");
    setDataInit(null);

    //add animation when closing modal
    setAnimation("close");
    await new Promise((r) => setTimeout(r, 400));
    setOpenModal(false);
    setAnimation("open");
  };

  const submitCenter = async (valuesForm) => {
    const { name, address, phoneNumber, capacity, workingHours } = valuesForm;

    if (dataLogo.length === 0) {
      message.error("Vui lòng upload ảnh Logo");
      return;
    }

    if (dataInit?.centerId) {
      //update
      const res = await callUpdateCenter(
        dataInit.centerId,
        name,
        address,
        phoneNumber,
        capacity,
        workingHours,
        dataLogo[0].name
      );
      if (res.data) {
        message.success("Cập nhật trung tâm thành công");
        handleReset();
        reloadTable();
      } else {
        notification.error({
          message: "Có lỗi xảy ra",
          description: res.message,
        });
      }
    } else {
      //create
      const res = await callCreateCenter(
        name,
        address,
        phoneNumber,
        capacity,
        workingHours,
        dataLogo[0].name
      );
      if (res.data) {
        message.success("Thêm mới trung tâm thành công");
        handleReset();
        reloadTable();
      } else {
        notification.error({
          message: "Có lỗi xảy ra",
          description: res.message,
        });
      }
    }
  };

  //   useEffect(() => {
  //     if (dataInit?.centerId && dataInit?.name) {
  //       setValue(dataInit.name);
  //     }
  //   }, [dataInit]);

  return (
    <>
      {openModal && (
        <>
          <ModalForm
            title={
              <>
                {dataInit?.centerId
                  ? "Cập nhật Trung tâm"
                  : "Tạo mới Trung tâm"}
              </>
            }
            open={openModal}
            modalProps={{
              onCancel: () => {
                handleReset();
              },
              afterClose: () => handleReset(),
              destroyOnClose: true,
              //   width: isMobile ? "100%" : 900,
              footer: null,
              keyboard: false,
              maskClosable: false,
              className: `modal-company ${animation}`,
              rootClassName: `modal-company-root ${animation}`,
            }}
            scrollToFirstError={true}
            preserve={false}
            form={form}
            onFinish={submitCenter}
            initialValues={dataInit?.centerId ? dataInit : {}}
            submitter={{
              render: (_, dom) => <FooterToolbar>{dom}</FooterToolbar>,
              submitButtonProps: {
                icon: <CheckSquareOutlined />,
              },
              searchConfig: {
                resetText: "Hủy",
                submitText: <>{dataInit?.centerId ? "Cập nhật" : "Tạo mới"}</>,
              },
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <ProFormText
                  label="Tên trung tâm"
                  name="name"
                  rules={[
                    { required: true, message: "Vui lòng không bỏ trống" },
                  ]}
                  placeholder="Nhập tên trung tâm..."
                />
              </Col>
              <Col span={12}>
                <ProFormText
                  label="Số điện thoại"
                  name="phoneNumber"
                  rules={[
                    { required: true, message: "Vui lòng không bỏ trống" },
                  ]}
                  placeholder="Số điện thoại trung tâm..."
                />
              </Col>
              <Col span={12}>
                <ProFormText
                  label="Capacity"
                  name="capacity"
                  rules={[
                    { required: true, message: "Vui lòng không bỏ trống" },
                  ]}
                  placeholder="Nhập sức chứa..."
                />
              </Col>
              <Col span={12}>
                <ProFormText
                  label="Giờ làm việc"
                  name="workingHours"
                  rules={[
                    { required: true, message: "Vui lòng không bỏ trống" },
                  ]}
                  placeholder="Giờ hoạt động của trung tâm..."
                />
              </Col>
              <Col span={8}>
                <Form.Item labelCol={{ span: 24 }} label="Ảnh Logo" name="logo">
                  <ConfigProvider locale={enUS}>
                    <Upload
                      name="logo"
                      listType="picture-card"
                      className="avatar-uploader"
                      maxCount={1}
                      multiple={false}
                      customRequest={handleUploadFileLogo}
                      beforeUpload={beforeUpload}
                      onChange={handleChange}
                      onRemove={(file) => handleRemoveFile(file)}
                      onPreview={handlePreview}
                      defaultFileList={
                        dataInit?.centerId
                          ? [
                              {
                                uid: uuidv4(),
                                name: dataInit?.image ?? "",
                                status: "done",
                                url: `${"http://localhost:8080/"}storage/center/${
                                  dataInit?.image
                                }`,
                              },
                            ]
                          : []
                      }
                    >
                      <div>
                        {loadingUpload ? <LoadingOutlined /> : <PlusOutlined />}
                        <div style={{ marginTop: 8 }}>Upload</div>
                      </div>
                    </Upload>
                  </ConfigProvider>
                </Form.Item>
              </Col>

              <Col span={16}>
                <ProFormTextArea
                  label="Địa chỉ"
                  name="address"
                  rules={[
                    { required: true, message: "Vui lòng không bỏ trống" },
                  ]}
                  placeholder="Nhập địa chỉ công ty..."
                  fieldProps={{
                    autoSize: { minRows: 4 },
                  }}
                />
              </Col>
            </Row>
          </ModalForm>
          <Modal
            open={previewOpen}
            title={previewTitle}
            footer={null}
            onCancel={() => setPreviewOpen(false)}
            style={{ zIndex: 1500 }}
          >
            <img alt="example" style={{ width: "100%" }} src={previewImage} />
          </Modal>
        </>
      )}
    </>
  );
};

export default ModalCenter;
