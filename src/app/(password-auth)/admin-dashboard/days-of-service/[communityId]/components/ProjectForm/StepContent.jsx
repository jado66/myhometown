import React from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step5 from "./Step5";
import ReportingStep from "./ReportingStep";

const StepContent = ({ activeStep, date, canSeeBudget }) => {
  switch (activeStep) {
    case 0:
      return <Step1 date={date} />;
    case 1:
      return <Step2 />;
    case 2:
      return <Step3 />;
    case 3:
      return <Step5 />;
    case 4:
      return <ReportingStep />;

    default:
      return null;
  }
};

export default StepContent;
