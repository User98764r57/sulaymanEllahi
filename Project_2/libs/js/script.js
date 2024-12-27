$(document).ready(function () {
    $('#refresh-btn').on('click', function () {
        location.reload();
    });

    $('#add-row-btn').on('click', function () {
        const newRow = `
            <tr>
                <td>[Enter]</td>
                <td>[Enter]</td>
                <td>[Enter]</td>
                <td>[Enter]</td>
                <td>
                    <button class="btn btn-warning btn-sm edit-btn">Edit</button>
                    <button class="btn btn-danger btn-sm delete-btn">Delete</button>
                </td>
            </tr>`;
        $('table tbody').append(newRow);
    });

    $('#role-filter, #location-filter').on('change', function () {
        const role = $('#role-filter').val();
        const location = $('#location-filter').val();

        $('table tbody tr').each(function () {
            const rowRole = $(this).find('td:nth-child(2)').text();
            const rowLocation = $(this).find('td:nth-child(4)').text();
            $(this).toggle(
                (!role || rowRole === role) &&
                (!location || rowLocation === location)
            );
        });
    });

    $('table').on('click', '.edit-btn', function () {
        alert('Edit functionality will be added later.');
    });

    $('table').on('click', '.delete-btn', function () {
        $(this).closest('tr').remove();
    });
});
