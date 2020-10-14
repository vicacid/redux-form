import _extends from '@babel/runtime/helpers/extends'
import _createClass from '@babel/runtime/helpers/createClass'
import _inheritsLoose from '@babel/runtime/helpers/inheritsLoose'
import { Component, createElement, createRef } from 'react'
import PropTypes from 'prop-types'
import invariant from 'invariant'
import get from 'lodash/get'
import createConnectedFields from './ConnectedFields'
import shallowCompare from './util/shallowCompare'
import plain from './structure/plain'
import prefixName from './util/prefixName'
import { withReduxForm } from './ReduxFormContext'
import validateComponentProp from './util/validateComponentProp'

var validateNameProp = function validateNameProp(prop) {
  if (!prop) {
    return new Error('No "names" prop was specified <Fields/>')
  }

  if (!Array.isArray(prop) && !prop._isFieldArray) {
    return new Error(
      'Invalid prop "names" supplied to <Fields/>. Must be either an array of strings or the fields array generated by FieldArray.'
    )
  }
}

var warnAndValidatePropType = PropTypes.oneOfType([
  PropTypes.func,
  PropTypes.arrayOf(PropTypes.func),
  PropTypes.objectOf(PropTypes.oneOfType([PropTypes.func, PropTypes.arrayOf(PropTypes.func)]))
])
var fieldsPropTypes = {
  component: validateComponentProp,
  format: PropTypes.func,
  parse: PropTypes.func,
  props: PropTypes.object,
  forwardRef: PropTypes.bool,
  validate: warnAndValidatePropType,
  warn: warnAndValidatePropType
}

var getFieldWarnAndValidate = function getFieldWarnAndValidate(prop, name) {
  return Array.isArray(prop) || typeof prop === 'function' ? prop : get(prop, name, undefined)
}

export default function createFields(structure) {
  var ConnectedFields = createConnectedFields(structure)

  var Fields = /*#__PURE__*/ (function(_Component) {
    _inheritsLoose(Fields, _Component)

    function Fields(props) {
      var _this

      _this = _Component.call(this, props) || this
      _this.connected = createRef()

      if (!props._reduxForm) {
        throw new Error('Fields must be inside a component decorated with reduxForm()')
      }

      var error = validateNameProp(props.names)

      if (error) {
        throw error
      }

      return _this
    }

    var _proto = Fields.prototype

    _proto.shouldComponentUpdate = function shouldComponentUpdate(nextProps) {
      return shallowCompare(this, nextProps)
    }

    _proto.componentDidMount = function componentDidMount() {
      this.registerFields(this.props.names)
    }

    _proto.UNSAFE_componentWillReceiveProps = function UNSAFE_componentWillReceiveProps(nextProps) {
      if (!plain.deepEqual(this.props.names, nextProps.names)) {
        var props = this.props
        var unregister = props._reduxForm.unregister // unregister old name

        this.props.names.forEach(function(name) {
          return unregister(prefixName(props, name))
        }) // register new name

        this.registerFields(nextProps.names)
      }
    }

    _proto.componentWillUnmount = function componentWillUnmount() {
      var props = this.props
      var unregister = props._reduxForm.unregister
      this.props.names.forEach(function(name) {
        return unregister(prefixName(props, name))
      })
    }

    _proto.registerFields = function registerFields(names) {
      var _this2 = this

      var props = this.props
      var register = props._reduxForm.register
      names.forEach(function(name) {
        return register(
          prefixName(props, name),
          'Field',
          function() {
            return getFieldWarnAndValidate(_this2.props.validate, name)
          },
          function() {
            return getFieldWarnAndValidate(_this2.props.warn, name)
          }
        )
      })
    }

    _proto.getRenderedComponent = function getRenderedComponent() {
      invariant(
        this.props.forwardRef,
        'If you want to access getRenderedComponent(), ' +
          'you must specify a forwardRef prop to Fields'
      )
      return this.connected.current ? this.connected.current.getRenderedComponent() : null
    }

    _proto.render = function render() {
      var props = this.props
      return createElement(
        ConnectedFields,
        _extends({}, this.props, {
          names: this.props.names.map(function(name) {
            return prefixName(props, name)
          }),
          ref: this.connected
        })
      )
    }

    _createClass(Fields, [
      {
        key: 'names',
        get: function get() {
          var props = this.props
          return this.props.names.map(function(name) {
            return prefixName(props, name)
          })
        }
      },
      {
        key: 'dirty',
        get: function get() {
          return this.connected.current ? this.connected.current.isDirty() : false
        }
      },
      {
        key: 'pristine',
        get: function get() {
          return !this.dirty
        }
      },
      {
        key: 'values',
        get: function get() {
          return this.connected.current ? this.connected.current.getValues() : {}
        }
      }
    ])

    return Fields
  })(Component)

  Fields.propTypes = _extends(
    {
      names: function names(props, propName) {
        return validateNameProp(props[propName])
      }
    },
    fieldsPropTypes
  )
  return withReduxForm(Fields)
}
