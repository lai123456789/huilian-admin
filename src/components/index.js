// base
import BasePage from './base/page'
import BaseTreeSelect from './base/tree-select'
import BaseKeepAlive from './base/keep-alive'
import BaseAutocomplete from './base/autocomplete'
import BaseEditTable from './base/edit-table'
import BaseSvgIcon from './base/svg-icon'
import BaseEmpty from './base/empty'
import BaseMenu from './base/menu'
import BaseSubmenu from './base/submenu'
import BaseMenuItem from './base/menu-item'
import BaseMenuItemGroup from './base/menu-item-group'
import BaseDialog from './base/dialog'
import BaseDrawer from './base/drawer'
import BaseForm from './base/form'
import BaseFormItem from './base/form-item'
import BaseInput from './base/input'
import BaseInputNumber from './base/input-number'
import BaseSelect from './base/select'
import BaseCheckbox from './base/checkbox'
import BaseRadio from './base/radio'
import BaseUpload from './base/upload'
import BaseSwitch from './base/switch'
import BaseDatePicker from './base/date-picker'
import BaseTimePicker from './base/time-picker'
import BaseViewer from './base/viewer'
import BaseViewerItem from './base/viewer-item'
import BaseRow from './base/row'
import BaseCol from './base/col'

// business
import BusinessAutocompleteBasic from './business/autocomplete-basic'
import BusinessAutocompleteCcl from './business/autocomplete-ccl'
import BusinessAutocompleteFormula from './business/autocomplete-formula'
import BusinessAutocompleteProduct from './business/autocomplete-product'
import BusinessAutocompleteWarehouse from './business/autocomplete-warehouse'
import BusinessAutocompleteBank from './business/autocomplete-bank'
import BusinessAutocompleteDriver from './business/autocomplete-driver'
import BusinessAutocompleteVehicle from './business/autocomplete-vehicle'
import BusinessAutocompleteCusCustomer from './business/autocomplete-cus-customer'
import BusinessAuditBar from './business/audit-bar'
import BusinessImportButton from './business/import-button'
import BusinessDropdownButton from './business/dropdown-button'
import BusinessExport from './business/export'
import BusinessStepsList from './business/steps-list'

const install = Vue => {
  // base
  Vue.component(BasePage.name, BasePage)
  Vue.component(BaseTreeSelect.name, BaseTreeSelect)
  Vue.component(BaseKeepAlive.name, BaseKeepAlive)
  Vue.component(BaseAutocomplete.name, BaseAutocomplete)
  Vue.component(BaseEditTable.name, BaseEditTable)
  Vue.component(BaseSvgIcon.name, BaseSvgIcon)
  Vue.component(BaseEmpty.name, BaseEmpty)
  Vue.component(BaseMenu.name, BaseMenu)
  Vue.component(BaseSubmenu.name, BaseSubmenu)
  Vue.component(BaseMenuItem.name, BaseMenuItem)
  Vue.component(BaseMenuItemGroup.name, BaseMenuItemGroup)
  Vue.component(BaseDialog.name, BaseDialog)
  Vue.component(BaseDrawer.name, BaseDrawer)
  Vue.component(BaseForm.name, BaseForm)
  Vue.component(BaseFormItem.name, BaseFormItem)
  Vue.component(BaseInput.name, BaseInput)
  Vue.component(BaseInputNumber.name, BaseInputNumber)
  Vue.component(BaseSelect.name, BaseSelect)
  Vue.component(BaseCheckbox.name, BaseCheckbox)
  Vue.component(BaseRadio.name, BaseRadio)
  Vue.component(BaseUpload.name, BaseUpload)
  Vue.component(BaseSwitch.name, BaseSwitch)
  Vue.component(BaseDatePicker.name, BaseDatePicker)
  Vue.component(BaseTimePicker.name, BaseTimePicker)
  Vue.component(BaseViewer.name, BaseViewer)
  Vue.component(BaseViewerItem.name, BaseViewerItem)
  Vue.component(BaseRow.name, BaseRow)
  Vue.component(BaseCol.name, BaseCol)

  // business
  Vue.component(BusinessAutocompleteBasic.name, BusinessAutocompleteBasic)
  Vue.component(BusinessAutocompleteCcl.name, BusinessAutocompleteCcl)
  Vue.component(BusinessAutocompleteFormula.name, BusinessAutocompleteFormula)
  Vue.component(BusinessAutocompleteProduct.name, BusinessAutocompleteProduct)
  Vue.component(BusinessAutocompleteWarehouse.name, BusinessAutocompleteWarehouse)
  Vue.component(BusinessAutocompleteBank.name, BusinessAutocompleteBank)
  Vue.component(BusinessAutocompleteDriver.name, BusinessAutocompleteDriver)
  Vue.component(BusinessAutocompleteVehicle.name, BusinessAutocompleteVehicle)
  Vue.component(BusinessAutocompleteCusCustomer.name, BusinessAutocompleteCusCustomer)
  Vue.component(BusinessAuditBar.name, BusinessAuditBar)
  Vue.component(BusinessImportButton.name, BusinessImportButton)
  Vue.component(BusinessDropdownButton.name, BusinessDropdownButton)
  Vue.component(BusinessExport.name, BusinessExport)
  Vue.component(BusinessStepsList.name, BusinessStepsList)
}

export default {
  install
}
