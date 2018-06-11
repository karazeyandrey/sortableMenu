$(function() {
    var itemLvlOne = 1;
    var itemLvlTwo = 2;
    var itemLvlThree = 3;

    $('#sortable').sortable({
        items: 'li.menu',
        update: function(ev, ui) {
            if (!canBeDropped(ui.item, ui.item.prev())) {
                $(this).sortable('cancel');
            } else {
                var movedCount = moveChilds(ui.item) + 1;
                var oldParent = ui.item.data('parent');
                reorderChilds(ui.item.prev());
                changeParent(ui.item);
                var newParent = ui.item.data('parent');
                decreaseCounters(oldParent, movedCount);
                increaceCounters(newParent, movedCount);
            }

        }
    });

    $('.content').on('click', '.remove-element', function(){
        var parentId = $(this).parent().parent().data('parent');
        var id = $(this).parent().parent().data('id');
        var removedCount = 1;

        removedCount = removeChilds(id, removedCount);
        decreaseCounters(parentId, removedCount);

        $(this).parent().parent().remove();
    });

    $('.content').on('click', '.toggle-child-visibility', function(){
        var elementId = $(this).parent().parent().data('id');
        var expanded = $(this).parent().parent().data('expanded');

        toggleChildVisibility(elementId, expanded);
        $(this).parent().parent().data('expanded', !expanded);

        if (expanded) {
            $(this).html('>');
        } else {
            $(this).html('v');
        }
    });

    var removeChilds = function(parentId, counter) {
        $('.menu').each(function() {
            if (parentId === $(this).data('parent')) {
                var id = $(this).data('id');
                $(this).remove();
                counter++;
                counter = removeChilds(id, counter);
            }
        });

        return counter;
    };

    var decreaseCounters = function(parentId, removedCount) {
        $('.menu').each(function() {
            if (parentId === $(this).data('id')) {
                var parent = $(this).data('parent');
                var counterElem = $(this).find('.child-counter');
                var counter = parseInt(counterElem.text());

                if (counter) {
                    counter = counter - removedCount;
                }
                counterElem.text(counter);

                if (typeof parent !== 'undefined') {
                    decreaseCounters(parent, removedCount);
                }
            }
        });
    };

    var increaceCounters = function(parentId, addCount) {
        $('.menu').each(function() {
            if (parentId === $(this).data('id')) {
                var parent = $(this).data('parent');
                var counterElem = $(this).find('.child-counter');
                var counter = parseInt(counterElem.text());
                counter = counter + addCount;

                counterElem.text(counter);

                if (typeof parent !== 'undefined') {
                    increaceCounters(parent, addCount);
                }
            }
        });
    };

    var toggleChildVisibility = function(id, expanded) {
        $('.menu').each(function() {
            if (id === $(this).data('parent')) {
                var toggleEl = $(this).find('.toggle-child-visibility');

                if (expanded) {
                    toggleEl.html('>');
                    $(this).hide();
                } else {
                    toggleEl.html('v');
                    $(this).show();
                }
                toggleChildVisibility($(this).data('id'), expanded);
            }
        });
    };

    var canBeDropped = function(item, prevItem) {
        var allowDrop = false;
        var itemLvl = getItemLvl(item);
        var prevItemLvl = getItemLvl(prevItem);

        if (
            (itemLvl === itemLvlTwo && prevItemLvl === itemLvlOne) ||
            (itemLvl === itemLvlTwo && prevItemLvl === itemLvlTwo) ||
            (itemLvl === itemLvlThree && prevItemLvl === itemLvlTwo) ||
            (itemLvl === itemLvlThree && prevItemLvl === itemLvlThree)
        ) {
            allowDrop = true;
        }

        return allowDrop;
    };

    var reorderChilds = function(item) {
        var itemLvl = getItemLvl(item);

        if (itemLvl === itemLvlTwo) {
            moveChilds(item);
        }
    };

    var moveChilds = function(item) {
        var id = item.data('id');
        var movedCount = 0;

        $('.menu').each(function() {
            if (id === $(this).data('parent')) {
                item.after($(this));
                movedCount++;
            }
        });

        return movedCount;
    };

    var changeParent = function(item) {
        var itemLvl = getItemLvl(item);

        $(item).prevAll().each(function() {
            if (getItemLvl($(this)) < itemLvl) {
                $(item).data('parent', $(this).data('id'));
                return false;
            }
        });
    };

    var getItemLvl = function(item) {
        var itemLvl;

        switch(true) {
            case item.hasClass('level-one'):
                itemLvl = itemLvlOne;
                break;
            case item.hasClass('level-two'):
                itemLvl = itemLvlTwo;
                break;
            case item.hasClass('level-three'):
                itemLvl = itemLvlThree;
                break;
        }

        return itemLvl;
    };

    var checkNameLength = function() {
        var nameLength = $('#name').val().length;

        if (nameLength > 50 || nameLength < 3) {
            $('#name').addClass('ui-state-error');
            updateTips('Name length must be between 3 and 50.');

            return false;
        } else {
            return true;
        }
    };

    var updateTips = function(text) {
        $('.validateTips')
            .text(text)
            .addClass('ui-state-highlight');

        setTimeout(function() {
            $('.validateTips').removeClass('ui-state-highlight', 1500);
        }, 500);
    };

    var addNewElement = function() {
        var valid = true;
        var parentId = $('#dialog-form').data('parent');

        valid = valid && checkNameLength();

        if (valid) {
            insertNewElem(parentId, $('#name').val());
            dialog.dialog( "close" );
        }

        return valid;
    };

    var insertNewElem = function (parentId, name) {
        var parentElem = $('.content').find('[data-id="' + parentId + '"]');
        var parentLvl = getItemLvl(parentElem);
        var itemLvl = parentLvl === itemLvlOne ? itemLvlTwo : itemLvlThree;
        var itemClass = itemLvl === itemLvlTwo ? 'level-two' : 'level-three';
        var newElemHtml = '<li class="menu ' + itemClass + ' ui-state-default" data-id="' + getRandomId() + '" data-parent="' +
            parentId + '" data-expanded="true">' +
            '<span class="block-name">' + name + '</span>' +
            '<span class="block-control">' +
            '<span class="remove-element">x</span>';

        if (itemLvl === itemLvlTwo) {
            newElemHtml +=  '<span class="add-element">+</span>' +
                '<span class="toggle-child-visibility">v</span>' +
                '<span class="child-counter">0</span>';
        }

        newElemHtml += '</span></li>';
        parentElem.after(newElemHtml);
        increaceCounters(parentId, 1);
    };

    var getRandomId = function() {
        return '_' + Math.random().toString(36).substr(2, 9);
    };

    var dialog = $('#dialog-form').dialog({
        autoOpen: false,
        height: 300,
        width: 400,
        modal: true,
        buttons: {
            'Add new': addNewElement,
            Cancel: function() {
                dialog.dialog('close');
            }
        },
        close: function() {
            form[0].reset();
            $('#name').removeClass('ui-state-error');
        }
    });

    var form = dialog.find('form').on('submit', function(event) {
        event.preventDefault();
        addNewElement();
    });

    $('.content').on('click', '.add-element', function(){
        $('#dialog-form').data('parent', $(this).parent().parent().data('id'));
        dialog.dialog('open');
    });

    $('#sortable li').disableSelection();
});