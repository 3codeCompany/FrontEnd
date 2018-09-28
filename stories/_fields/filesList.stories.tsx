import * as React from "react";
import { storiesOf } from "@storybook/react";

import { BaseX, Test2 } from "./example";
import { BFileList } from "../../src/layout/BootstrapForm";
import { LoaderContainer } from "../../src/ctrl/LoaderContainer";

storiesOf("Files fieds", module).add("File list", () => (
    <>
        <BaseX base={"1"} />

        <Test2 base={"asd"} loading={true} />
        <BFileList  />

    </>
));