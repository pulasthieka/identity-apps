/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { IdentifiableComponentInterface } from "@wso2is/core/models";
import { SessionStorageUtils } from "@wso2is/core/utils";
import { GenericIcon } from "@wso2is/react-components";
import React, { FunctionComponent, ReactElement, useState } from "react";
import { useSelector } from "react-redux";
import { Dropdown, Icon, Menu } from "semantic-ui-react";
import OrganizationSwitchDropdown from "./organization-switch-dropdown";
import { organizationConfigs } from "../../../../extensions";
import { ReactComponent as CrossIcon } from "../../../../themes/default/assets/images/icons/cross-icon.svg";
import { AppState, getMiscellaneousIcons } from "../../../core";
import { useGetOrganizationBreadCrumb } from "../../api";
import {
    BreadcrumbItem,
    GenericOrganization,
    OrganizationResponseInterface
} from "../../models";
import { OrganizationUtils } from "../../utils";

/**
 * Interface for component dropdown.
 */
type OrganizationSwitchDropdownInterface = IdentifiableComponentInterface;

export const OrganizationSwitchBreadcrumb: FunctionComponent<OrganizationSwitchDropdownInterface> = (
    props: OrganizationSwitchDropdownInterface
): ReactElement => {
    const { "data-componentid": componentId } = props;

    const currentOrganization: OrganizationResponseInterface = useSelector(
        (state: AppState) => state.organization.organization
    );

    const [ showBreadcrumb, setShowBreadcrumb ] = useState<boolean>(false);

    const { data: breadcrumbList } = useGetOrganizationBreadCrumb();

    const handleOrganizationSwitch = (
        organization: GenericOrganization
    ): void => {
        let newOrgPath: string = "";

        if (OrganizationUtils.isRootOrganization(organization)) {
            newOrgPath = `${ window[ "AppUtils" ].getConfig().tenantPathWithoutSuperTenant
            } /${ window[ "AppUtils" ].getConfig().appBase }`;
        } else {
            newOrgPath =
                window[ "AppUtils" ].getConfig().tenantPathWithoutSuperTenant +
                "/o/" +
                organization.id +
                "/" +
                window[ "AppUtils" ].getConfig().appBase;
        }

        // Clear the callback url of the previous organization.
        SessionStorageUtils.clearItemFromSessionStorage(
            "auth_callback_url_console"
        );

        // Redirect the user to the newly selected organization path.
        window.location.replace(newOrgPath);
    };

    const generateBreadcrumb = (): ReactElement => {
        if (breadcrumbList.length <= 4) {
            return (
                <Menu className="organization-breadcrumb">
                    { breadcrumbList.map(
                        (breadcrumb: BreadcrumbItem, index: number) => {
                            if (index !== breadcrumbList.length - 1) {
                                return (
                                    <Menu.Item
                                        key={ index }
                                        className="breadcrumb"
                                    >
                                        <span
                                            onClick={ () =>
                                                handleOrganizationSwitch(
                                                    breadcrumb
                                                )
                                            }
                                        >
                                            { breadcrumb.name }
                                        </span>
                                        <Icon
                                            name="caret right"
                                            className="separator-icon"
                                        />
                                    </Menu.Item>
                                );
                            }

                            return (
                                <OrganizationSwitchDropdown
                                    key={ index }
                                    triggerName={ breadcrumb.name }
                                    handleOrganizationSwitch={
                                        handleOrganizationSwitch
                                    }
                                    isBreadcrumbItem={ true }
                                />
                            );
                        }
                    ) }
                    <Menu.Item className="breadcrumb">
                        <GenericIcon
                            size="nano"
                            defaultIcon
                            transparent
                            icon={ CrossIcon }
                            onClick={ () => setShowBreadcrumb(false) }
                            className="close-icon"
                        />
                    </Menu.Item>
                </Menu>
            );
        }

        return (
            <Menu className="organization-breadcrumb">
                <Menu.Item className="breadcrumb">
                    { OrganizationUtils.isRootOrganization(breadcrumbList[ 0 ]) ? (
                        organizationConfigs.superOrganizationBreadcrumb(
                            breadcrumbList[ 0 ],
                            handleOrganizationSwitch
                        )
                    ) : (
                        <span
                            onClick={ () =>
                                handleOrganizationSwitch(breadcrumbList[ 0 ])
                            }
                        >
                            { breadcrumbList[ 0 ].name }
                        </span>
                    ) }

                    <Icon name="caret right" className="separator-icon" />
                </Menu.Item>
                <Dropdown
                    item
                    text="..."
                    icon="caret right"
                    className="breadcrumb-dropdown breadcrumb"
                >
                    <Dropdown.Menu>
                        { breadcrumbList.map(
                            (breadcrumb: BreadcrumbItem, index: number) => {
                                if (
                                    index === 0 ||
                                    index > breadcrumbList.length - 3
                                ) {
                                    return;
                                }

                                return (
                                    <Dropdown.Item
                                        key={ index }
                                        onClick={ () =>
                                            handleOrganizationSwitch(breadcrumb)
                                        }
                                        icon="caret right"
                                        text={ breadcrumb.name }
                                        className="breadcrumb-dropdown-item"
                                    />
                                );
                            }
                        ) }
                    </Dropdown.Menu>
                </Dropdown>
                <Menu.Item className="breadcrumb">
                    <span
                        onClick={ () =>
                            handleOrganizationSwitch(
                                breadcrumbList[ breadcrumbList.length - 2 ]
                            )
                        }
                    >
                        { breadcrumbList[ breadcrumbList.length - 2 ].name }
                    </span>
                    <Icon name="caret right" className="separator-icon" />
                </Menu.Item>
                <OrganizationSwitchDropdown
                    triggerName={ breadcrumbList[ breadcrumbList.length - 1 ].name }
                    handleOrganizationSwitch={ handleOrganizationSwitch }
                    isBreadcrumbItem={ true }
                />
                <Menu.Item className="breadcrumb">
                    <GenericIcon
                        size="nano"
                        defaultIcon
                        transparent
                        icon={ CrossIcon }
                        onClick={ () => setShowBreadcrumb(false) }
                        className="close-icon"
                    />
                </Menu.Item>
            </Menu>
        );
    };

    if (!breadcrumbList || breadcrumbList.length === 0) {
        return;
    }

    if (breadcrumbList.length === 1) {
        return (
            <div className="organization-breadcrumb-wrapper">
                <OrganizationSwitchDropdown
                    triggerName={ currentOrganization.name }
                    handleOrganizationSwitch={ handleOrganizationSwitch }
                />
            </div>
        );
    }

    return (
        <div className="organization-breadcrumb-wrapper">
            { !showBreadcrumb ? (
                <div
                    className="organization-breadcrumb trigger"
                    onClick={ () => setShowBreadcrumb(true) }
                >
                    <div className="icon-wrapper">
                        <GenericIcon
                            transparent
                            data-componentid="component-dropdown-trigger-icon"
                            data-testid="tenant-dropdown-trigger-icon"
                            icon={ getMiscellaneousIcons().tenantIcon }
                            size="micro"
                        />
                    </div>
                    <div className="item">
                        <span>{ currentOrganization?.name }</span>
                        <Icon name="caret right" className="separator-icon" />
                    </div>
                </div>
            ) : (
                generateBreadcrumb()
            ) }
        </div>
    );
};

OrganizationSwitchBreadcrumb.defaultProps = {
    "data-componentid": "organization-switch-breadcrumb"
};
