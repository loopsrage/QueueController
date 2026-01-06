import {Tab, TabPanel} from "react-tabs";
import {CrudGrid} from "../../crudGrid/crudGrid.jsx";
import {Nav, TabPane} from "react-bootstrap";


export const InitialTabRef = () => {
    return {
        tabs: {
            tabList: {},
            tabAttr: {},
            tabPanel: {}
        },
        currentIndex: 0
    }
}

export const NavTitle = ({title}) => {
    return (
        <Nav.Item>
            <Nav.Link eventKey={title} >{title}</Nav.Link>
        </Nav.Item>
    )
}

export const NavPanel = ({title, content}) => {
    return (
        <TabPane eventKey={title}>
            {content}
        </TabPane>
    )
}

export const NewTab = (ref, title, content, attributes) => {
    const st = ref.current
    st.tabs.tabList[title] = <NavTitle key={st.currentIndex} title={title} />
    st.tabs.tabPanel[title] = (<NavPanel key={st.currentIndex} title={title} content={content} />)
    st.tabs.tabAttr[title] = {
        name: title,
        index: st.currentIndex,
        ...attributes
    }
    ref.current = st
}

export const GetTabs = (ref) => {
    return Object.keys(ref.current.tabs.tabList).map((k) => ref.current.tabs.tabList[k])
}

export const GetPanels = (ref) => {
    return Object.keys(ref.current.tabs.tabPanel).map((k) => ref.current.tabs.tabPanel[k])
}

export const DeleteTab = (ref, index) => {
    const st = ref.current

    delete st.tabs.tabList[index]
    delete st.tabs.tabPanel[index]

    ref.current = st
}

export const CreateGridPanes = (ref, data, controls) => {
    const st = ref.current
    if (Array.isArray(data)) {
        data.forEach((i) => {
            const comp = <CrudGrid key={i} api={i.props.api} inputRef={i.gridRef} controls={i.controls} />
            NewTab(ref, i.props.api.endpoint(), comp, controls)
        })
    }
    ref.current = st
}