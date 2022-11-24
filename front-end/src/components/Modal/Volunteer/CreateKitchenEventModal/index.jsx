import React, { useContext, useState } from "react";
import PropTypes from "prop-types";
import { message, Row, Checkbox, DatePicker } from "antd";
import Button from "../../../Button";
import Modal, { CommentTextArea } from "../../styles";
import moment from "moment";
import AxiosInstance from "../../../../API/api";
import { AuthContext } from "../../../../Contexts/AuthContext";

const { RangePicker } = DatePicker;

const CreateKitchenEventModal = ({ visible, setVisible, date, getEvents }) => {
  const { user, userType } = useContext(AuthContext);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [startDate, setStartDate] = useState(date);
  const [endDate, setEndDate] = useState(null);
  const shiftTime = window.location.pathname.includes("kitchen-am")
    ? "AM"
    : "PM";
  const disabledDate = (current) => {
    // disable all days with different name.
    return current && current.format("dddd") !== date.format("dddd");
  };

  const createEvent = async () => {
    setLoading(true);
    try {
      const userNameArray = user.displayName
        ? user.displayName.split(" ")
        : "Test User".split(" ");
      const firstName = userNameArray.slice(0, -1).join(" ");
      const lastName = userNameArray[userNameArray.length - 1];
      let result = {};

      if (isRecurring) {
        result = await AxiosInstance.post("/events/recurringEvent", {
          firstName,
          lastName,
          eventType: shiftTime === "AM" ? "kitam" : "kitpm",
          userId: user.uid,
          userType,
          startDate: startDate.format("YYMMDD"),
          endDate: endDate.format("YYMMDD"),
          userComment: comment,
          slot: 4, // we don't use this on the front end, but it's required on the backend so we just pass in 4 as a placeholder
        });
      } else {
        result = await AxiosInstance.post("/events/createEvent", {
          firstName,
          lastName,
          eventType: shiftTime === "AM" ? "kitam" : "kitpm",
          userId: user.uid,
          userType,
          eventDate: date.format("YYMMDD"),
          userComment: comment,
          slot: 4,
        });
      }
      if (result.data.success) {
        getEvents();
        setVisible((prev) => ({
          ...prev,
          volunteerCreateKitchenEventModalVisible: false,
        }));
      } else {
        message.error(result.data.error);
      }
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  const Footer = () => (
    <Row justify="center">
      <Button
        onClick={createEvent}
        loading={loading}
        disabled={isRecurring && (!startDate || !endDate)}
      >
        Confirm
      </Button>
    </Row>
  );

  const Title = () => (
    <Row justify="center">
      <h3>{`${shiftTime} Kitchen Shift`}</h3>
    </Row>
  );
  return (
    <Modal
      visible={visible}
      onCancel={() =>
        setVisible((prev) => ({
          ...prev,
          volunteerCreateKitchenEventModalVisible: false,
        }))
      }
      footer={<Footer />}
      title={<Title />}
    >
      <p>
        <strong>Date: </strong>
        {moment(date).format("dddd, MMMM Do")}
      </p>
      <p>
        <strong>Time: </strong>
        {shiftTime === "AM" ? "9:30AM - 12:30AM" : "1:30PM - 4:30PM"}
      </p>
      <b>Comments:</b>
      <CommentTextArea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
      />
      <Checkbox
        onChange={() => setIsRecurring(!isRecurring)}
        checked={isRecurring}
      >
        This is a recurring event
      </Checkbox>
      {isRecurring && (
        <div
          style={{
            marginTop: "10px",
          }}
        >
          <RangePicker
            value={[startDate, endDate]}
            disabledDate={disabledDate}
            onCalendarChange={(dates) => {
              setStartDate(dates[0]);
              setEndDate(dates[1]);
            }}
            onChange={(values) => {
              setStartDate(values[0]);
              setEndDate(values[1]);
              console.log(values);
            }}
          />
        </div>
      )}
    </Modal>
  );
};

CreateKitchenEventModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  setVisible: PropTypes.func.isRequired,
  date: PropTypes.object.isRequired,
  getEvents: PropTypes.func.isRequired,
};

export default CreateKitchenEventModal;
