import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  InputGroup,
  InputGroupAddon,
  Input,
  Form,
  Col,
  Label,
  FormGroup,
  FormText,
  Table,
  Row
} from 'reactstrap'
import EnableSecurity from './EnableSecurity'

export function fetchSecurityAcls () {
  fetch(`/security/acls`, {
    credentials: 'include'
  })
    .then(response => response.json())
    .then(data => {
      this.setState({ acls: data })
    })
}

class Acls extends Component {
  constructor (props) {
    super(props)
    this.state = {
      acls: [],
    }

    this.handleAddAcl = this.handleAddAcl.bind(this)
    this.handleSaveAcls = this.handleSaveAcls.bind(this)
    this.fetchSecurityAcls = fetchSecurityAcls.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleApply = this.handleApply.bind(this)
    // this.handleAclChange = this.handleAclChange.bind(this)
    // this.deleteAcl = this.deleteAcl.bind(this)
  }

  componentDidMount () {
    if (this.props.loginStatus.authenticationRequired) {
      this.fetchSecurityAcls()
    }
  }

  handleAddAcl (event) {
    var newAcl = {
      type: 'readonly',
      isNew: true
    }
    this.setState(
      {
        selectedAcl: newAcl,
        selectedIndex: this.state.acls.length - 1
      },
      () => {
        this.refs['selectedAcl'].scrollIntoView()
      }
    )
  }

  handleSaveAcls (event) {
    fetch(`/security/acls`, {
      credentials: 'include',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.state.acls)
    })
      .then(response => {
        console.log("saveACLs response", response)
      })
  }

  handleApply (event) {
    event.preventDefault()

    var isNew = this.state.selectedAcl.isNew

    //Local save in the view state (Not really saved in the config file)
    if (isNew) {
      console.log("isNew")
      var sources = [""]
      var paths = [""]
      console.log("selectedAcl",this.state.selectedAcl)
      this.state({acls: [...this.state.acls, {
          context: this.state.selectedAcl.context,
          paths: this.state.selectedAcl.paths==null?[""]:this.state.selectedAcl.paths,
          //sources: this.selectedAcl.sources==null?[""]:this.selectedAcl.sources,
          user: this.selectedAcl.user,
          permission: this.selectedAcl.permission,
        }],
        selectedAcl: null
      })
    }

    // if (
    //   !this.state.selectedUser.userId ||
    //   this.state.selectedUser.userId.length == 0
    // ) {
    //   alert('Please specify a User Id')
    //   return
    // }

    // if (this.state.selectedUser.password) {
    //   if (
    //     this.state.selectedUser.password !=
    //     this.state.selectedUser.confirmPassword
    //   ) {
    //     alert('Passwords do not match')
    //     return
    //   }
    // }

    // var isNew = this.state.selectedUser.isNew

    // var payload = {
    //   password: this.state.selectedUser.password,
    //   type: this.state.selectedUser.type || 'readonly'
    // }

    // fetch(`/security/acls/${this.state.selectedUser.userId}`, {
    //   method: isNew ? 'POST' : 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(payload),
    //   credentials: 'include'
    // })
    //   .then(response => response.text())
    //   .then(response => {
    //     this.setState({
    //       selectedUser: null,
    //       selectedIndex: -1
    //     })
    //     alert(response)
    //     this.fetchSecurityAcls()
    //   })
  }

  aclClicked (acl, index) {
    function getAcl () {
      var tmpAcl = JSON.parse(JSON.stringify(acl))
      if (tmpAcl.sources == null) tmpAcl.sources=[""]
      if (tmpAcl.paths== null) tmpAcl.paths=[""]
      return tmpAcl
    }
    this.setState(
      {
        selectedAcl: getAcl(),
        selectedIndex: index
      },
      () => {
        this.refs['selectedAcl'].scrollIntoView()
      }
    )
  }

  handleCancel (event) {
    this.setState({ selectedAcl: null })
  }

  render () {
    return (
      <div className='animated fadeIn'>
        {this.props.loginStatus.authenticationRequired === false && (
          <EnableSecurity />
        )}
        {this.props.loginStatus.authenticationRequired && (
          <div>
            <Card>
              <CardHeader>
                <i className='fa fa-align-justify' />Access Control Lists
              </CardHeader>
              <CardBody>
                <Table hover responsive bordered striped size='sm'>
                  <thead>
                    <tr>
                      <th>Context</th>
                      <th colSpan={4} align={'center'}>Ressources</th>
                    </tr>
                    <tr>
                      <th>Context</th>
                      <th>Paths</th>
                      <th>Sources</th>
                      <th>Assigned user</th>
                      <th>Permissons</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(this.state.acls || []).map((acl, index) => {
                      return (
                        <tr
                          key={index}
                          onClick={this.aclClicked.bind(
                            this,
                            acl,
                            index
                          )}
                        >
                          <td>{acl.context}</td>
                          <td>{acl.paths}</td>
                          <td>{acl.sources}</td>
                          <td>{acl.user}</td>
                          <td>{acl.permission}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </Table>
              </CardBody>
              <CardFooter>
                <Button size='sm' color='primary' onClick={this.handleAddAcl}>
                  <i className='fa fa-plus-circle' /> Add
                </Button>
                ---
                <Button size='sm' color='primary' onClick={this.handleSaveAcls}>
                  <i className='fa fa-plus-circle' /> Save to file (need reboot after)
                </Button>
              </CardFooter>
            </Card>

            {this.state.selectedAcl && (
              <div ref='selectedAcl'>
                <Card>
                  <CardHeader>
                    <i className='fa fa-align-justify' />ACL
                  </CardHeader>
                  <CardBody>
                    <FormGroup row>
                      <Col md='2'>
                        <Label htmlFor='aclid'>ACL ID</Label>
                      </Col>
                      <Col xs='12' md='9'>
                        {this.state.selectedAcl.isNew && (
                          <Input
                            type='text'
                            name='aclId'
                            value={this.state.selectedAcl.aclId}
                            onChange={this.handleAclChange}
                          />
                        )}
                        {!this.state.selectedAcl.isNew && (
                          <Label>{this.state.selectedAcl.aclId}</Label>
                        )}
                      </Col>
                    </FormGroup>
                    <FormGroup row>
                      <Col md='2'>
                        <Label htmlFor='context'>Context</Label>
                      </Col>
                      <Col xs='12' md='9'>
                        <Input
                          type='text'
                          name='context'
                          value={this.state.selectedAcl.context}
                          onChange={this.handleUserChange}
                        />
                      </Col>
                    </FormGroup>
                    <FormGroup row>
                      <Col md='2'>
                        <Label htmlFor='text-input'>Paths</Label>
                      </Col>
                      <Col xs='12' md='9'>
                        <Input
                          type='text'
                          name='paths'
                          value={this.state.selectedAcl.paths}
                          onChange={this.handleUserChange}
                        />
                      </Col>
                    </FormGroup>
                    <FormGroup row>
                      <Col md='2'>
                        <Label htmlFor='text-input'>Sources</Label>
                      </Col>
                      <Col xs='12' md='9'>
                        <Input
                          type='text'
                          name='sources'
                          value={this.state.selectedAcl.sources}
                          onChange={this.handleUserChange}
                        />
                      </Col>
                    </FormGroup>
                    <FormGroup row>
                      <Col md='2'>
                        <Label htmlFor='select'>Permissions</Label>
                      </Col>
                      <Col xs='12' md='2'>
                        <Input
                          type='select'
                          name='permission'
                          value={this.state.selectedAcl.permission}
                          onChange={this.handleUserChange}
                        >
                          <option value='read'>Read Only</option>
                          <option value='write'>Read/Write</option>
                          <option value='put'>Put</option>
                        </Input>
                      </Col>
                    </FormGroup>
                  </CardBody>
                  <CardFooter>
                    <Row>
                      <Col xs='4' md='1'>
                        <Button
                          size='sm'
                          color='primary'
                          onClick={this.handleApply}
                        >
                          <i className='fa fa-dot-circle-o' /> Apply
                        </Button>
                      </Col>
                      <Col xs='4' md='1'>
                        <Button
                          size='sm'
                          color='secondary'
                          onClick={this.handleCancel}
                        >
                          <i className='fa fa-ban' /> Cancel
                        </Button>
                      </Col>
                      <Col xs='4' md='10' className='text-right'>
                        <Button
                          size='sm'
                          color='danger'
                          onClick={this.deleteAcl}
                        >
                          <i className='fa fa-ban' /> Delete
                        </Button>
                      </Col>
                    </Row>
                  </CardFooter>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
}

const mapStateToProps = ({ securityAcls }) => ({ securityAcls })

export default connect(mapStateToProps)(Acls)

