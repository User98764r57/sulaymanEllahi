$(document).ready(function () {
    $('#refreshBtn').on('click', function () {
        location.reload(); 
    });

let searchTerm = "";
let departmentFilter = "";
let locationFilter = "";

const getLocations = (searchTerm = "") => {
    $.ajax({
        url: "libs/php/getAllLocations.php",
        type: "GET",
        dataType: "JSON",
        data: { searchTerm },
        success: function (result) {
            if (result.status.name === "ok") {
                $("#locationTable").empty();
                result.data.forEach(location => {
                    $("#locationTable").append(
                        `<tr id="${location.id}">
                            <td id="${location.id}" class="align-middle text-nowrap bg-light">${location.name}</td>
                            <td class="align-middle text-end text-nowrap bg-light">
                                <button
                                    id="editLocationBtn"
                                    type="button"
                                    class="btn btn-primary btn-sm"
                                    data-bs-toggle="modal"
                                    data-bs-target="#editLocationModal"
                                    data-id="${location.id}">
                                    &#x270F;&#xFE0F;
                                </button>
                                <button
                                    type="button"
                                    id="deleteLocationBtn"
                                    class="btn btn-primary btn-sm"
                                    data-id="${location.id}"
                                    data-name="${location.name}">
                                    &#x1F5D1;&#xFE0F;
                                </button>
                            </td>
                        </tr>`
                    );
                });
            }
        },
        error: function () {
            alert("Error fetching locations.");
        },
    });
};

const getDepartments = (searchTerm = "") => {
    $.ajax({
        url: "libs/php/getAllDepartments.php",
        type: "GET",
        dataType: "JSON",
        data: { searchTerm },
        success: function (result) {
            if (result.status.name === "ok") {
                $("#departmentTable").empty();
                result.data.forEach(department => {
                    $("#departmentTable").append(
                        `<tr id="${department.id}">
                            <td id="${department.id}" class="align-middle text-nowrap bg-light">${department.name}</td>
                            <td class="align-middle text-nowrap d-none d-md-table-cell bg-light">${department.location}</td>
                            <td class="align-middle text-end text-nowrap bg-light">
                                <button
                                    id="editDepartmentBtn"
                                    type="button"
                                    class="btn btn-primary btn-sm"
                                    data-bs-toggle="modal"
                                    data-bs-target="#editDepartmentModal"
                                    data-id="${department.id}">
                                    &#x270F;&#xFE0F;
                                </button>
                                <button
                                    type="button"
                                    id="deleteDepartmentBtn"
                                    class="btn btn-primary btn-sm"
                                    data-id="${department.id}"
                                    data-name="${department.name}">
                                    &#x1F5D1;&#xFE0F;
                                </button>
                            </td>
                        </tr>`
                    );
                });
            }
        },
        error: function () {
            alert("Error fetching departments.");
        },
    });
};

const getPersonnel = (searchTerm = "", departmentFilter = "", locationFilter = "") => {
    $.ajax({
        url: "libs/php/getAll.php",
        type: "GET",
        dataType: "JSON",
        data: { searchTerm, departmentFilter, locationFilter },
        success: function (result) {
            if (result.status.name === "ok") {
                $("#personnelTable").empty();
                result.data.forEach(personnel => {
                    $("#personnelTable").append(
                        `<tr id="${personnel.id}">
                            <td class="align-middle text-nowrap bg-light">${personnel.lastName}, ${personnel.firstName}</td>
                            <td class="align-middle text-nowrap d-none d-md-table-cell bg-light">${personnel.department}</td>
                            <td class="align-middle text-nowrap d-none d-md-table-cell bg-light">${personnel.location}</td>
                            <td class="align-middle text-nowrap d-none d-md-table-cell bg-light">${personnel.email}</td>
                            <td class="text-end text-nowrap bg-light">
                                <button
                                    type="button"
                                    class="btn btn-primary btn-sm"
                                    data-bs-toggle="modal"
                                    data-bs-target="#editPersonnelModal"
                                    data-id="${personnel.id}">
                                    &#x270F;&#xFE0F;
                                </button>
                                <button
                                    type="button"
                                    class="btn btn-primary btn-sm deletePersonnelBtn"
                                    data-bs-toggle="modal"
                                    data-bs-target="#deletePersonnelModal"
                                    data-id="${personnel.id}">
                                    &#x1F5D1;&#xFE0F;
                                </button>
                            </td>
                        </tr>`
                    );
                });
            }
        },
        error: function () {
            alert("Error fetching personnel.");
        },
    });
};

$(document).ready(function () {
  getLocations();
  getDepartments();
  getPersonnel(searchTerm, departmentFilter, locationFilter);
});

$("#searchInp").on("keyup", function () {
  searchTerm = $("#searchInp").val();
  if ($("#personnelBtn").hasClass("active")) {
    getPersonnel(searchTerm, departmentFilter, locationFilter);
  } else {
    if ($("#departmentsBtn").hasClass("active")) {
      getDepartments(searchTerm);
    } else {
      getLocations(searchTerm);
    }
  }
});

const resetPersonnel = () => {
  searchTerm = "";
  $("#filterPersonnelDepartment").val("");
  $("#filterPersonnelLocation").val("");
  departmentFilter = "";
  locationFilter = "";
  getPersonnel(searchTerm, departmentFilter, locationFilter);
};

$("#filterBtn").click(function () {
  if ($("#personnelBtn").hasClass("active")) {
    $("#filterPersonnelModal").modal("show");
  }
});

$("#filterPersonnelModal").on("show.bs.modal", function (e) {
    $.ajax({
        url: "libs/php/getAllDepartments.php",
        type: "GET",
        dataType: "JSON",
        data: { searchTerm: "" },
        success: function (result) {
            if (result.status.name === "ok") {
                $("#filterPersonnelDepartment")
                    .empty()
                    .append(
                        $("<option>", {
                            value: "",
                            text: "All",
                        })
                    );
                result.data.forEach(department => {
                    $("#filterPersonnelDepartment").append(
                        $("<option>", {
                            value: department.name,
                            text: department.name,
                        })
                    );
                });
                $("#filterPersonnelDepartment").val(departmentFilter);
            }
        },
        error: function () {
            alert("Error fetching departments.");
        },
    });

    $.ajax({
        url: "libs/php/getAllLocations.php",
        type: "GET",
        dataType: "JSON",
        data: { searchTerm: "" },
        success: function (result) {
            if (result.status.name === "ok") {
                $("#filterPersonnelLocation")
                    .empty()
                    .append(
                        $("<option>", {
                            value: "",
                            text: "All",
                        })
                    );
                result.data.forEach(location => {
                    $("#filterPersonnelLocation").append(
                        $("<option>", {
                            value: location.name,
                            text: location.name,
                        })
                    );
                });
                $("#filterPersonnelLocation").val(locationFilter);
            }
        },
        error: function () {
            alert("Error fetching locations.");
        },
    });
});

$("#filterPersonnelDepartment").on("change", function () {
  $("#filterPersonnelLocation").val("");
});
$("#filterPersonnelLocation").on("change", function () {
  $("#filterPersonnelDepartment").val("");
});

$("#addBtn").click(function () {
  if ($("#personnelBtn").hasClass("active")) {
    $("#insertPersonnelModal").modal("show");
  } else {
    if ($("#departmentsBtn").hasClass("active")) {
      $("#insertDepartmentModal").modal("show");
    } else {
      $("#insertLocationModal").modal("show");
      $("#errorMessageLocationAdd").empty();
      $("#insertLocationName").val("");
    }
  }
});

$("#personnelBtn").click(function () {
  $("#searchInp").val("");
  resetPersonnel();
  $("#filterBtn").prop("disabled", false);
});

$("#departmentsBtn").click(function () {
  $("#searchInp").val("");
  getDepartments();
  $("#filterBtn").removeClass("btn-light").addClass("btn-primary");
});

$("#locationsBtn").click(function () {
  $("#searchInp").val("");
  getLocations();
  $("#filterBtn").removeClass("btn-light").addClass("btn-primary");
});

$("#editPersonnelModal").on("show.bs.modal", function (e) {
  $.ajax({
    url: "libs/php/getPersonnelByID.php",
    type: "POST",
    dataType: "JSON",
    data: {
      id: $(e.relatedTarget).attr("data-id"),
    },
    success: function (result) {
      var resultCode = result.status.code;
      if (resultCode == 200) {
        $("#editPersonnelEmployeeID").val(result.data.personnel[0].id);
        $("#editPersonnelFirstName").val(result.data.personnel[0].firstName);
        $("#editPersonnelLastName").val(result.data.personnel[0].lastName);
        $("#editPersonnelJobTitle").val(result.data.personnel[0].jobTitle);
        $("#editPersonnelEmailAddress").val(result.data.personnel[0].email);

        $("#editPersonnelDepartment").html("");
        $.each(result.data.department, function () {
          $("#editPersonnelDepartment").append(
            $("<option>", {
              value: this.id,
              text: this.name,
            })
          );
        });
        $("#editPersonnelDepartment").val(
          result.data.personnel[0].departmentID
        );
      } else {
        $("#editPersonnelModal .modal-title").replaceWith(
          "Error fetching data."
        );
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $("#editPersonnelModal .modal-title").replaceWith(
        "Error fetching data"
      );
      alert("Error fetching data.");
    },
  });
});

$("#editPersonnelForm").on("submit", function (e) {
  e.preventDefault();
  const id = $("#editPersonnelEmployeeID").val();
  const firstName = $("#editPersonnelFirstName").val();
  const lastName = $("#editPersonnelLastName").val();
  const jobTitle = $("#editPersonnelJobTitle").val();
  const email = $("#editPersonnelEmailAddress").val();
  const departmentID = $("#editPersonnelDepartment").val();
  const personnelFormData = {
    id,
    firstName,
    lastName,
    jobTitle,
    email,
    departmentID,
  };

  $.ajax({
    url: "libs/php/editPersonnel.php",
    type: "POST",
    dataType: "JSON",
    data: personnelFormData,
    success: function (result) {
      var resultCode = result.status.code;
      if (resultCode == 200) {
        $("#editPersonnelModal").modal("hide");
        getPersonnel(searchTerm, departmentFilter, locationFilter);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      alert("Error updating record.");
    },
  });
});

$("#editDepartmentModal").on("show.bs.modal", function (e) {
  $.ajax({
    url: "libs/php/getDepartmentByID.php",
    type: "POST",
    dataType: "JSON",
    data: {
      id: $(e.relatedTarget).attr("data-id"),
    },
    success: function (result) {
      var resultCode = result.status.code;
      $("#errorMessageDepartment").empty();
      if (resultCode == 200) {
        $("#editDepartmentID").val(result.data.department[0].id);
        $("#editDepartmentName").val(result.data.department[0].name);

        $("#editDepartmentLocation").html("");
        $.each(result.data.location, function () {
          $("#editDepartmentLocation").append(
            $("<option>", {
              value: this.id,
              text: this.name,
            })
          );
        });
        $("#editDepartmentLocation").val(
          result.data.department[0].locationID
        );
      } else {
        $("#editPersonnelModal .modal-title").replaceWith(
          "Error fetching data"
        );
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $("#editPersonnelModal .modal-title").replaceWith(
        "Error fetching data."
      );
      alert("Error fetching data.");
    },
  });
});

$("#editDepartmentForm").on("submit", function (e) {
  e.preventDefault();

  const id = $("#editDepartmentID").val();
  const departmentName = $("#editDepartmentName").val();
  const location = $("#editDepartmentLocation").val();
  const departmentFormData = {
    id,
    departmentName,
    location,
  };

  let isDuplicate = false;
  $("#departmentTable tr").each(function () {
    let currentRowId = $(this).find("td:first").attr("id");
    let firstColumnData = $(this).find("td:first").text();

    if (
      firstColumnData.toLowerCase() === departmentName.toLowerCase() &&
      currentRowId !== id
    ) {
      $("#errorMessageDepartment").text("This department already exists.");
      isDuplicate = true;
      return false;
    }
  });

  if (!isDuplicate) {
    $.ajax({
      url: "libs/php/editDepartment.php",
      type: "POST",
      dataType: "JSON",
      data: departmentFormData,
      success: function (result) {
        if (result.status.code == 200) {
          $("#editDepartmentModal").modal("hide");
          getDepartments(searchTerm);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        alert("Error updating record");
      },
    });
  }
});

$("#editLocationModal").on("show.bs.modal", function (e) {
  $.ajax({
    url: "libs/php/getLocationByID.php",
    type: "POST",
    dataType: "JSON",
    data: {
      id: $(e.relatedTarget).attr("data-id"),
    },
    success: function (result) {
      $("#errorMessageLocation").empty();
      var resultCode = result.status.code;

      if (resultCode == 200) {
        $("#editLocationID").val(result.data[0].id);
        $("#editLocationName").val(result.data[0].name);
      } else {
        $("#editPersonnelModal .modal-title").replaceWith(
          "Error fetching location data"
        );
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $("#editPersonnelModal .modal-title").replaceWith(
        "Error fetching data."
      );
      alert("Error fetching data.");
    },
  });
});

$("#editLocationForm").on("submit", function (e) {
  e.preventDefault();

  const id = $("#editLocationID").val();
  const locationName = $("#editLocationName").val();
  const locationFormData = {
    id,
    locationName,
  };

  let isDuplicate = false;
  $("#locationTable tr").each(function () {
    let currentRowId = $(this).find("td:first").attr("id");
    let firstColumnData = $(this).find("td:first").text();

    if (
      firstColumnData.toLowerCase() === locationName.toLowerCase() &&
      currentRowId !== id
    ) {
      $("#errorMessageLocation").text("This location already exists.");
      isDuplicate = true;
      return false;
    }
  });

  if (!isDuplicate) {
    $.ajax({
      url: "libs/php/editLocation.php",
      type: "POST",
      dataType: "JSON",
      data: locationFormData,
      success: function (result) {
        if (result.status.code == 200) {
          $("#editLocationModal").modal("hide");
          getLocations(searchTerm);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        alert("Error updating record");
      },
    });
  }
});

$("#deletePersonnelModal").on("show.bs.modal", function (e) {
  $.ajax({
    url: "libs/php/getPersonnelByID.php",
    type: "POST",
    dataType: "JSON",
    data: {
      id: $(e.relatedTarget).attr("data-id"),
    },
    success: function (result) {
      var resultCode = result.status.code;
      if (resultCode == 200) {
        $("#deletePersonnelEmployeeID").val(result.data.personnel[0].id);
        $("#deleteName").text(
          `${result.data.personnel[0].firstName} ${result.data.personnel[0].lastName}`
        );
      } else {
        $("#deletePersonnelModal .modal-title").text("Confirmation");
      }
    },
    error: function () {
      $("#deletePersonnelModal .modal-title").text("Confirmation");
      alert("Error fetching data.");
    },
  });
});

$("#confirmDeletePersonnel").on("click", function () {
  const id = $("#deletePersonnelEmployeeID").val();

  $.ajax({
    url: "libs/php/deletePersonnelByID.php",
    type: "POST",
    dataType: "JSON",
    data: { id },
    success: function (result) {
      var resultCode = result.status.code;
      if (resultCode == 200) {
        $("#deletePersonnelModal").modal("hide");
        getPersonnel(searchTerm, departmentFilter, locationFilter);
      }
    },
    error: function () {
      alert("Error deleting records");
    },
  });
});

$(document).on("click", "#deleteDepartmentBtn", function () {
  const deleteID = $(this).attr("data-id");
  const deleteName = $(this).attr("data-name");

  $.ajax({
    url: "libs/php/countPersonnelByDepartment.php",
    type: "POST",
    dataType: "JSON",
    data: { departmentID: deleteID },
    success: function (result) {
      var resultCode = result.status.code;
      if (resultCode == 200) {
        if (result.data.length > 0) {
          $("#deleteDepartmentErrorModal").modal("show");
          $("#deleteDepartmentError").text(deleteName);
          $("#personnelAssigned").text(result.data.length);
        } else {
          $.ajax({
            url: "libs/php/getDepartmentByID.php",
            type: "POST",
            dataType: "JSON",
            data: { id: deleteID },
            success: function (result) {
              var resultCode = result.status.code;
              if (resultCode == 200) {
                $("#deleteDepartmentModal").modal("show");
                $("#deleteDepartmentID").val(result.data.department[0].id);
                $("#deleteDepartment").text(result.data.department[0].name);
                $("#deleteDepartmentModal .modal-title").text("Confirmation");
              }
            },
            error: function () {
              $("#deleteDepartmentModal .modal-title").text("Confirmation");
              alert("Error fetching data.");
            },
          });
        }
      }
    },
    error: function () {
      $("#deleteDepartmentModal .modal-title").text("Confirmation");
      alert("Error fetching data.");
    },
  });
});

$("#confirmDeleteDepartment").on("click", function () {
  const id = $("#deleteDepartmentID").val();

  $.ajax({
    url: "libs/php/deleteDepartmentByID.php",
    type: "POST",
    dataType: "JSON",
    data: { id },
    success: function (result) {
      var resultCode = result.status.code;
      if (resultCode == 200) {
        $("#deleteDepartmentModal").modal("hide");
        getDepartments(searchTerm);
      }
    },
    error: function () {
      alert("Error deleting records");
    },
  });
});

$(document).on("click", "#deleteLocationBtn", function () {
  const deleteLocationID = $(this).attr("data-id");
  const locationNameError = $(this).attr("data-name");

  $.ajax({
    url: "libs/php/countDepartmentByLocation.php",
    type: "POST",
    dataType: "JSON",
    data: { locationID: deleteLocationID },
    success: function (result) {
      var resultCode = result.status.code;
      if (resultCode == 200) {
        if (result.data.length > 0) {
          $("#deleteLocationErrorModal").modal("show");
          $("#deleteLocationError").text(locationNameError);
          $("#departmentAssign").text(result.data.length);
        } else {
          $.ajax({
            url: "libs/php/getLocationByID.php",
            type: "POST",
            dataType: "JSON",
            data: { id: deleteLocationID },
            success: function (result) {
              var resultCode = result.status.code;
              if (resultCode == 200) {
                $("#deleteLocationModal").modal("show");
                $("#deleteLocationID").val(result.data[0].id);
                $("#deleteLocation").text(result.data[0].name);
                $("#deleteLocationModal .modal-title").text("Confirmation");
              }
            },
            error: function () {
              $("#deleteLocationModal .modal-title").text("Confirmation");
              alert("Error fetching data.");
            },
          });
        }
      }
    },
    error: function () {
      $("#deleteLocationModal .modal-title").text("Confirmation");
      alert("Error fetching data.");
    },
  });
});

$("#confirmDeleteLocation").on("click", function () {
  const id = $("#deleteLocationID").val();

  $.ajax({
    url: "libs/php/deleteLocationByID.php",
    type: "POST",
    dataType: "JSON",
    data: { id },
    success: function (result) {
      var resultCode = result.status.code;
      if (resultCode == 200) {
        $("#deleteLocationModal").modal("hide");
        getLocations(searchTerm);
      }
    },
    error: function () {
      alert("Error deleting records");
    },
  });
});

$("#insertLocationForm").on("submit", function (e) {
  e.preventDefault();
  const locationName = $("#insertLocationName").val();
  let isDuplicate = false;

  $("#locationTable tr").each(function () {
    let firstColumnData = $(this).find("td:first").text();
    if (firstColumnData.toLowerCase() === locationName.toLowerCase()) {
      $("#errorMessageLocationAdd").text("This location already exists.");
      isDuplicate = true;
      return false;
    }
  });

  if (!isDuplicate) {
    $.ajax({
      url: "libs/php/insertLocation.php",
      type: "POST",
      dataType: "JSON",
      data: { locationName },
      success: function (result) {
        var resultCode = result.status.code;
        if (resultCode == 200) {
          $("#insertLocationModal").modal("hide");
          getLocations(searchTerm);
        }
      },
      error: function () {
        alert("Unable to insert location.");
      },
    });
  }
});

$("#insertDepartmentModal").on("show.bs.modal", function () {
  $.ajax({
    url: "libs/php/getAllLocations.php",
    type: "POST",
    dataType: "JSON",
    data: { searchTerm: "" },
    success: function (result) {
      var resultCode = result.status.code;
      if (resultCode == 200) {
        $("#errorMessageDepartmentAdd").empty();
        $("#insertDepartmentName").val("");
        $("#insertDepartmentLocation").html("");
        $.each(result.data, function () {
          $("#insertDepartmentLocation").append(
            $("<option>", {
              value: this.id,
              text: this.name,
            })
          );
        });
      } else {
        $("#insertDepartmentModal .modal-title").text("Error retrieving data");
      }
    },
    error: function () {
      $("#insertDepartmentModal .modal-title").text("Error fetching data.");
      alert("Error fetching data.");
    },
  });
});

$("#insertDepartmentForm").on("submit", function (e) {
  e.preventDefault();
  const departmentName = $("#insertDepartmentName").val();
  const location = $("#insertDepartmentLocation").val();
  let isDuplicate = false;

  $("#departmentTable tr").each(function () {
    let firstColumnData = $(this).find("td:first").text();
    if (firstColumnData.toLowerCase() === departmentName.toLowerCase()) {
      $("#errorMessageDepartmentAdd").text("This department already exists.");
      isDuplicate = true;
      return false;
    }
  });

  if (!isDuplicate) {
    $.ajax({
      url: "libs/php/insertDepartment.php",
      type: "POST",
      dataType: "JSON",
      data: {
        name: departmentName,
        locationID: location,
      },
      success: function (result) {
        if (result.status.code == 200) {
          $("#insertDepartmentModal").modal("hide");
          getDepartments(searchTerm);
        }
      },
      error: function () {
        alert("Unable to add department.");
      },
    });
  }
});

$("#insertPersonnelModal").on("show.bs.modal", function () {
  $.ajax({
    url: "libs/php/getAllDepartments.php",
    type: "POST",
    dataType: "JSON",
    data: { searchTerm: "" },
    success: function (result) {
      var resultCode = result.status.code;
      if (resultCode == 200) {
        $("#insertPersonnelDepartment").html("");
        $.each(result.data, function () {
          $("#insertPersonnelDepartment").append(
            $("<option>", {
              value: this.id,
              text: this.name,
            })
          );
        });
      } else {
        $("#insertPersonnelModal .modal-title").text("Error retrieving data");
      }
    },
    error: function () {
      $("#insertPersonnelModal .modal-title").text("Error fetching data.");
      alert("Error fetching data.");
    },
  });
});

$("#insertPersonnelForm").on("submit", function (e) {
  e.preventDefault();

  const insertFirstName = $("#insertPersonnelFirstName").val();
  const insertLastName = $("#insertPersonnelLastName").val();
  const insertJobTitle = $("#insertPersonnelJobTitle").val();
  const insertEmail = $("#insertPersonnelEmailAddress").val();
  const insertDepartment = $("#insertPersonnelDepartment").val();

  $.ajax({
    url: "libs/php/insertPersonnel.php",
    type: "POST",
    dataType: "JSON",
    data: {
      firstName: insertFirstName,
      lastName: insertLastName,
      jobTitle: insertJobTitle,
      email: insertEmail,
      departmentID: insertDepartment,
    },
    success: function (result) {
      if (result.status.code == 200) {
        $("#insertPersonnelModal").modal("hide");
        getPersonnel(searchTerm, departmentFilter, locationFilter);
      }
    },
    error: function () {
      alert("Unable to add personnel.");
    },
  });
});

$("#filterPersonnelForm").on("submit", function (e) {
  departmentFilter = $("#filterPersonnelDepartment").val();
  locationFilter = $("#filterPersonnelLocation").val();
  getPersonnel(searchTerm, departmentFilter, locationFilter);
  e.preventDefault();
  $("#filterPersonnelModal").modal("hide");
});

});